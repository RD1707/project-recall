import os
import cohere
from dotenv import load_dotenv
from threading import Thread

from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll, Vertical, Horizontal
from textual.widgets import Button, Footer, Input, Static, RichLog, LoadingIndicator
from textual.message import Message

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

class AIResponseReady(Message):
    """Mensagem customizada para quando a resposta da IA estiver pronta."""
    def __init__(self, response: str, error: bool = False) -> None:
        self.response = response
        self.error = error
        super().__init__()

class ChatApp(App):
    """Uma aplicação de chat TUI para demonstrar a IA Sinapse."""
    CSS_PATH = "chat.css"
    BINDINGS = [("ctrl+d", "quit", "Sair"), ("ctrl+c", "quit", "Sair")]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_name = "Usuário"
        self.chat_history = []
        self.preamble = get_sinapse_system_prompt()
        self.waiting_response = False

    def compose(self) -> ComposeResult:
        """Cria e organiza os widgets da interface."""
        # Tela de boas-vindas
        with Container(id="welcome-screen"):
            yield Static("╔═══════════════════════════════╗", id="welcome-border-top")
            yield Static("║   S I N A P S E   A I        ║", id="welcome-title")
            yield Static("║   Project Recall Core        ║", id="welcome-subtitle")
            yield Static("╚═══════════════════════════════╝", id="welcome-border-bottom")
            with Vertical(id="welcome-inputs"):
                yield Input(placeholder="Digite seu nome...", id="name-input")
                yield Button("[ INICIAR DEMONSTRAÇÃO ]", variant="primary", id="start-button")
        
        # Tela de chat
        with Container(id="chat-screen"):
            with VerticalScroll(id="chat-scroll"):
                yield RichLog(highlight=True, markup=True, id="chat-log", wrap=True)
            with Horizontal(id="input-bar"):
                yield Input(placeholder="Digite sua mensagem...", id="message-input", disabled=False)
                yield Button("[ ENVIAR ]", variant="success", id="send-button")
                yield LoadingIndicator(id="loading")
        
        yield Footer()

    def on_mount(self) -> None:
        """Configurações iniciais quando o app inicia."""
        self.query_one("#name-input").focus()
        self.query_one("#chat-screen").styles.display = "none"
        self.query_one("#loading").styles.display = "none"

    def switch_to_chat_screen(self):
        """Esconde a tela de início e mostra a tela de chat."""
        self.query_one("#welcome-screen").styles.display = "none"
        self.query_one("#chat-screen").styles.display = "block"
        self.query_one("#message-input").focus()
        
        # Mensagem de boas-vindas da Sinapse
        chat_log = self.query_one("#chat-log", RichLog)
        welcome_msg = f"""[bold white]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold white]
[bold white]> SISTEMA INICIADO[/bold white]
[bold white]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold white]

[bold white]SINAPSE AI >[/bold white] Olá, {self.user_name}. 

Eu sou a [bold]Sinapse[/bold], a inteligência artificial do [bold]Project Recall[/bold].

Estou pronta para demonstrar minhas capacidades.

Você pode me perguntar sobre:
  • Minhas funcionalidades técnicas
  • O algoritmo de Repetição Espaçada (SRS)
  • Geração de flashcards
  • Análise de desempenho
  • Quiz Multiplayer

Como posso demonstrar minha tecnologia?

[dim]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/dim]
"""
        chat_log.write(welcome_msg)

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Gerencia o clique nos botões."""
        if event.button.id == "start-button":
            name_input = self.query_one("#name-input", Input)
            user_name = name_input.value.strip()
            if user_name:
                self.user_name = user_name
                self.switch_to_chat_screen()
            else:
                name_input.placeholder = "[!] Por favor, digite seu nome"
        elif event.button.id == "send-button" and not self.waiting_response:
            self.process_user_message()

    def on_input_submitted(self, event: Input.Submitted) -> None:
        """Gerencia o pressionar de 'Enter' nos campos de input."""
        if event.input.id == "name-input" and event.input.value:
            self.query_one("#start-button", Button).press()
        elif event.input.id == "message-input" and not self.waiting_response:
            self.process_user_message()

    def process_user_message(self):
        """Pega a mensagem do usuário, exibe e chama a IA."""
        message_input = self.query_one("#message-input", Input)
        user_message = message_input.value.strip()
        if not user_message:
            return

        message_input.value = ""
        chat_log = self.query_one("#chat-log", RichLog)

        # Exibe mensagem do usuário
        user_display = f"\n[bold white]> {self.user_name.upper()}[/bold white]\n[white]{user_message}[/white]\n[dim]───────────────────────────────────────────────────[/dim]\n"
        chat_log.write(user_display)

        # Adiciona ao histórico
        self.chat_history.append({"role": "USER", "message": user_message})

        # Mostra indicador de carregamento
        self.waiting_response = True
        self.query_one("#loading").styles.display = "block"
        self.query_one("#message-input").disabled = True
        self.query_one("#send-button").disabled = True

        # Chama a IA em uma thread separada
        thread = Thread(target=self.call_ai, args=(user_message,), daemon=True)
        thread.start()

    def call_ai(self, user_message: str):
        """Chama a API da Cohere em uma thread separada."""
        try:
            response = co.chat(
                model='command-a-03-2025',
                message=user_message,
                chat_history=self.chat_history,
                preamble=self.preamble,
                temperature=0.3
            )
            ai_response_text = response.text
            self.chat_history.append({"role": "CHATBOT", "message": ai_response_text})
            self.post_message(AIResponseReady(ai_response_text, error=False))
        except Exception as e:
            error_msg = f"Erro na conexão com a IA: {str(e)}"
            self.post_message(AIResponseReady(error_msg, error=True))

    def on_ai_response_ready(self, message: AIResponseReady) -> None:
        """Callback quando a resposta da IA está pronta."""
        chat_log = self.query_one("#chat-log", RichLog)
        
        if message.error:
            ai_display = f"[bold white]> ERRO DO SISTEMA[/bold white]\n[white]{message.response}[/white]\n[dim]───────────────────────────────────────────────────[/dim]\n"
        else:
            ai_display = f"[bold white]> SINAPSE AI[/bold white]\n[white]{message.response}[/white]\n[dim]───────────────────────────────────────────────────[/dim]\n"
        
        chat_log.write(ai_display)
        
        # Esconde indicador de carregamento e reabilita input
        self.waiting_response = False
        self.query_one("#loading").styles.display = "none"
        self.query_one("#message-input").disabled = False
        self.query_one("#send-button").disabled = False
        self.query_one("#message-input").focus()

if __name__ == "__main__":
    app = ChatApp()
    app.run()