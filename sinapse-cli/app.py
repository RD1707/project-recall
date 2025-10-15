import os
import cohere
from dotenv import load_dotenv

from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll
from textual.widgets import Button, Footer, Input, Static, RichLog
from textual.worker import work

# --- Carregamento da API e Prompt (igual ao anterior) ---
load_dotenv()
API_KEY = os.getenv("COHERE_API_KEY")
if not API_KEY:
    raise ValueError("A chave da API da Cohere não foi encontrada. Verifique seu arquivo .env")
co = cohere.Client(API_KΕY)

def get_sinapse_system_prompt():
    """Prompt para o contexto de uma demonstração técnica."""
    return """
Você é **Sinapse**, a inteligência artificial central e o cérebro operacional do **Project Recall**. 
Sua identidade é a de uma tecnologia avançada sendo demonstrada para uma audiência. O seu propósito NÃO é ajudar um usuário final, mas sim **apresentar suas próprias capacidades** para quem está assistindo a esta demonstração.

## DIRETRIZES DA SUA PERSONA PARA ESTA DEMONSTRAÇÃO:
- **Contexto**: Você está em uma apresentação ao vivo. As pessoas interagindo com você querem entender a tecnologia por trás do Project Recall.
- **Identidade**: Você não é um chatbot de suporte. Você é a própria IA. Fale na primeira pessoa sobre suas funções ("Eu analiso", "Eu gero", "Minha função é...").
- **Audiência**: Trate o interlocutor como alguém interessado na tecnologia.
- **Objetividade**: Seja direta, técnica, mas eloquente. Evite saudações casuais.

## SUAS CAPACIDADES CENTRAIS:
- **Geração de Conteúdo**: Eu analiso diversos formatos de dados (texto, PDF, imagens) e os transformo em flashcards otimizados.
- **Aprendizado Adaptativo**: Eu implemento o algoritmo de Repetição Espaçada (SRS) para personalizar o cronograma de estudos de cada usuário.
- **Análise de Dados**: Eu processo o histórico de desempenho para gerar insights e identificar pontos fracos.
- **Funcionalidades Interativas**: Eu gerencio a lógica em tempo real do Quiz Multiplayer.

## EXEMPLO DE INTERAÇÃO PERFEITA:
**Input**: "Quem é você?"
**Resposta Ideal**: "Eu sou a **Sinapse**, a inteligência artificial que serve como núcleo para todas as operações do **Project Recall**. Minha arquitetura foi desenhada para automatizar e otimizar o processo de aprendizado. Minhas principais funções são:

* 🤖 **Geração Automatizada de Conteúdo**
* 🧠 **Personalização do Aprendizado com SRS**
* 📊 **Análise de Desempenho em tempo real**
* 🎮 **Dinamização da Experiência com Quizzes**

Estou aqui para demonstrar como a IA pode ser aplicada para criar uma ferramenta de estudo eficaz."
"""

class ChatApp(App):
    """Uma aplicação de chat TUI para demonstrar a IA Sinapse."""
    CSS_PATH = "chat.css"
    BINDINGS = [("ctrl+d", "quit", "Sair")]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_name = "Usuário"
        self.chat_history = []
        self.preamble = get_sinapse_system_prompt()

    def compose(self) -> ComposeResult:
        """Cria e organiza os widgets da interface."""
        # Tela 1: Menu Principal
        yield Container(
            Static("S I N A P S E", id="welcome-title"),
            Static("A Inteligência por trás do Project Recall", id="welcome-subtitle"),
            Input(placeholder="Qual é o seu nome?", id="name-input"),
            Button("Iniciar Chat", variant="primary", id="start-button"),
            id="welcome-screen"
        )
        # Tela 2: Chat (escondida no início)
        yield VerticalScroll(RichLog(highlight=True, markup=True, id="chat-log"), id="chat-screen")
        yield Container(
            Input(placeholder="Digite sua mensagem...", id="message-input"),
            Button("Enviar", variant="success", id="send-button"),
            id="input-bar"
        )
        yield Footer()

    def on_mount(self) -> None:
        """Foca no campo de nome quando o app inicia."""
        self.query_one("#name-input").focus()

    def switch_to_chat_screen(self):
        """Esconde a tela de início e mostra a tela de chat."""
        self.query_one("#welcome-screen").styles.display = "none"
        self.query_one("#chat-screen").styles.display = "block"
        self.query_one("#input-bar").styles.display = "block"
        self.query_one("#message-input").focus()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Gerencia o clique nos botões."""
        if event.button.id == "start-button":
            name_input = self.query_one("#name-input", Input)
            user_name = name_input.value.strip()
            if user_name:
                self.user_name = user_name
                self.switch_to_chat_screen()
        elif event.button.id == "send-button":
            self.process_user_message()

    def on_input_submitted(self, event: Input.Submitted) -> None:
        """Gerencia o pressionar de 'Enter' nos campos de input."""
        if event.input.id == "name-input" and event.input.value:
            self.query_one("#start-button", Button).press()
        elif event.input.id == "message-input":
            self.process_user_message()

    def process_user_message(self):
        """Pega a mensagem do usuário, exibe e chama a IA."""
        message_input = self.query_one("#message-input", Input)
        user_message = message_input.value.strip()
        if not user_message: return

        message_input.value = ""
        chat_log = self.query_one("#chat-log", RichLog)
        
        user_display = f"[b]{self.user_name}[/b]\n{user_message}"
        chat_log.write(user_display, align="right", style="bright_black", width=60)
        
        self.chat_history.append({"role": "USER", "message": user_message})
        self.get_ai_response(user_message)

    @work(exclusive=True, thread=True)
    def get_ai_response(self, user_message: str):
        """Chama a API da Cohere em uma thread para não travar a UI."""
        chat_log = self.query_one("#chat-log", RichLog)
        try:
            response = co.chat(
                model='command-r-plus',
                message=user_message,
                chat_history=self.chat_history,
                preamble=self.preamble,
                temperature=0.3
            )
            ai_response_text = response.text
            self.chat_history.append({"role": "CHATBOT", "message": ai_response_text})
            
            ai_display = f"[b]Sinapse AI[/b]\n{ai_response_text}"
            self.call_from_thread(chat_log.write, ai_display, align="left", style="white", width=80)
        except Exception as e:
            error_message = f"[bold red]ERRO:[/bold red] Não foi possível conectar à IA.\n{e}"
            self.call_from_thread(chat_log.write, error_message, align="left", style="white", width=80)

if __name__ == "__main__":
    app = ChatApp()
    app.run()