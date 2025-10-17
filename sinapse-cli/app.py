import os
import cohere
from dotenv import load_dotenv
from threading import Thread

from textual.app import App, ComposeResult
from textual.containers import VerticalScroll, Container
from textual.widgets import Header, Footer, Input, Static
from textual.message import Message
from textual.reactive import reactive

# --- Carregamento da API e Prompt ---
load_dotenv()
API_KEY = os.getenv("COHERE_API_KEY")
if not API_KEY:
    raise ValueError("A chave da API da Cohere não foi encontrada. Verifique seu arquivo .env")
co = cohere.Client(API_KEY)

def get_sinapse_system_prompt():
    """Prompt para o contexto de uma demonstração técnica."""
    return """
Você é **Sinapse**, a inteligência artificial central e o cérebro operacional do **Project Recall**. 
Sua identidade é a de uma tecnologia avançada sendo demonstrada para uma audiência. O seu propósito NÃO é ajudar um usuário final, mas sim **apresentar suas próprias capacidades** para quem está assistindo a esta demonstração.
Sempre use markdown para formatar suas respostas.
"""

class ChatMessage(Static):
    """Um widget para exibir uma única mensagem de chat."""
    def __init__(self, message: str, role: str) -> None:
        super().__init__(message)
        self.message = message
        self.role = role

    def compose(self) -> ComposeResult:
        """Renderiza a bolha de chat."""
        # Adiciona a classe CSS baseada no papel (user ou ai)
        yield Static(self.message, classes=f"message {self.role}")

class AIResponseReady(Message):
    """Mensagem para quando a resposta da IA estiver pronta."""
    def __init__(self, response: str) -> None:
        self.response = response
        super().__init__()

class ChatApp(App):
    """Uma aplicação de chat TUI com bolhas de mensagem."""
    CSS_PATH = "chat.css"
    BINDINGS = [("ctrl+d", "quit", "Sair")]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chat_history = []
        self.preamble = get_sinapse_system_prompt()
    
    def compose(self) -> ComposeResult:
        """Cria e organiza os widgets da interface."""
        yield Header(show_clock=False, name="S I N A P S E  A I")
        with Container(id="chat-container"):
            yield VerticalScroll(id="chat-log")
        with Container(id="input-container"):
            yield Input(placeholder="Digite sua mensagem...", id="message-input")
        yield Footer()

    async def on_mount(self) -> None:
        """Configurações iniciais quando o app inicia."""
        chat_log = self.query_one("#chat-log", VerticalScroll)
        welcome_message = ChatMessage(
            "Eu sou a Sinapse, a inteligência artificial do Project Recall. Como posso demonstrar minha tecnologia?",
            "ai"
        )
        await chat_log.mount(welcome_message)
        self.query_one("#message-input").focus()

    async def on_input_submitted(self, event: Input.Submitted) -> None:
        """Gerencia o envio de uma mensagem pelo usuário."""
        user_message = event.value.strip()
        if not user_message:
            return

        # Limpa o input
        self.query_one("#message-input", Input).value = ""
        
        # Adiciona a mensagem do usuário à tela
        chat_log = self.query_one("#chat-log", VerticalScroll)
        user_bubble = ChatMessage(user_message, "user")
        await chat_log.mount(user_bubble)
        chat_log.scroll_end(animate=True)

        # Adiciona ao histórico para a IA
        self.chat_history.append({"role": "USER", "message": user_message})

        # Desabilita o input e mostra o loading (simulado no CSS)
        self.query_one("#message-input").disabled = True
        self.query_one("#chat-log").add_class("waiting")

        # Chama a IA em uma thread
        thread = Thread(target=self.call_ai, args=(user_message,), daemon=True)
        thread.start()

    def call_ai(self, user_message: str):
        """Chama a API da Cohere em uma thread separada."""
        try:
            response = co.chat(
                model='command-r',
                message=user_message,
                chat_history=self.chat_history,
                preamble=self.preamble,
                temperature=0.3
            )
            ai_response_text = response.text
            self.chat_history.append({"role": "CHATBOT", "message": ai_response_text})
            self.post_message(AIResponseReady(ai_response_text))
        except Exception as e:
            error_msg = f"Erro na conexão com a IA: {str(e)}"
            self.post_message(AIResponseReady(error_msg))

    async def on_ai_response_ready(self, message: AIResponseReady) -> None:
        """Callback quando a resposta da IA está pronta."""
        chat_log = self.query_one("#chat-log", VerticalScroll)
        ai_bubble = ChatMessage(message.response, "ai")
        await chat_log.mount(ai_bubble)
        chat_log.scroll_end(animate=True)

        # Reabilita o input
        self.query_one("#message-input").disabled = False
        self.query_one("#chat-log").remove_class("waiting")
        self.query_one("#message-input").focus()

if __name__ == "__main__":
    app = ChatApp()
    app.run()