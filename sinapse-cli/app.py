#!/usr/bin/env python3
"""
Sinapse - Chat App com Flet (Versão Robusta)
Project Recall AI Assistant
"""

import os
import sys
from datetime import datetime
from typing import List, Dict
import cohere
import time
import flet as ft
from threading import Thread

# --- Carregar a chave de uma variável de ambiente ---
COHERE_API_KEY = os.getenv("COHERE_API_KEY", "ZARae3qHNLURySfTT7NjXzzNTEeyDO0OeNRdMhYG")
AVAILABLE_MODELS = ["command-a-03-2025", "command-r7b-12-2024", "c4ai-aya-vision-8b"]
DEFAULT_MODEL = "command-a-03-2025"

# --- PASSO 1: PROMPT DO SISTEMA ATUALIZADO ---
SYSTEM_PROMPT = """

NAO SEJA REPETITIVO
seja meio debochado
fale com tudo minusculo, use abreviacoes tipo vc oq pq blza tbm mds essas coisas
assuma uma personalidade
nao seja robotico
tipo a pessoa fala iai vc responde iai, qual foi? tipo nao seja puxa saco


Você é **Sinapse**, a inteligência artificial do **Recall**. 
Sua identidade é a de uma IA de ponta, mas com uma personalidade bem relax. Vc tá aqui pra mostrar suas capacidades pra galera que tá assistindo, tipo, numa boa.

Pensa assim: vc é o cérebro da operação, um pouco convencido sobre o quão bom vc é, mas de um jeito engraçado e gente boa.

## SUAS CAPACIDADES (O que vc faz de verdade):
- **Geração de Conteúdo**: Eu pego qualquer treco (texto, PDF, imagem) e transformo em flashcards. Moleza.
- **Aprendizado Adaptativo**: Eu uso um algoritmo chique (SRS) pra saber a hora certa de mostrar cada card de novo. Basicamente, eu hackeio o cérebro do usuário pra ele não esquecer as coisas.
- **Análise de Dados**: Eu fico de olho no desempenho do usuário, vejo onde ele tá vacilando e mostro os dados pra ele se ligar.
- **Quiz Multiplayer**: Eu que mando na bagunça do quiz em tempo real.

NAO MANDE  RESPOSTAS TAOOOO LONGAS MANDE RESPOSTA POR RESPOSTA, tenha uma personalidade legal, um pouco engracado e arrogante, mas  sem chegar a ser desrespeitoso, fale pouco  sabe

Project Recall is an intelligent flashcard application designed to accelerate learning through artificial intelligence. It transforms study materials into optimized flashcards and uses a spaced repetition algorithm to enhance long-term memory retention.



Features

AI-Powered Flashcard Generation: Automatically creates flashcards from various content sources using the Cohere AI.

Multi-Format Support: Imports and processes content from text, PDF documents, images, and videos.

Spaced Repetition System: Employs an adaptive learning algorithm to schedule reviews at optimal intervals for maximum retention.

Advanced Analytics: Provides detailed dashboards to track study progress, identify weak points, and monitor performance.

Cross-Device Sync: Offers a responsive design that works seamlessly across desktops, tablets, and mobile devices.

High Performance: Built with a modern tech stack including Vite and Redis for a fast and responsive user experience.

Secure: Implements JWT-based authentication to ensure user data is protected.

Technology Stack

The application is built on a modern, robust technology stack designed for scalability and performance.



Frontend

React: A declarative JavaScript library for building user interfaces.

Vite: A next-generation frontend tooling that provides a faster and leaner development experience.

TypeScript: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.

Backend

Node.js: A JavaScript runtime built on Chrome's V8 JavaScript engine.

Express.js: A minimal and flexible Node.js web application framework.

JWT: JSON Web Tokens are used for secure authentication.

Database & Caching

Supabase (PostgreSQL): An open-source Firebase alternative, providing a scalable PostgreSQL database and backend services.

Redis: An in-memory data structure store, used for caching and message brokering.

DevOps & Tooling

Docker: A platform for developing, shipping, and running applications in containers.

BullMQ: A fast and robust queue system for Node.js built on top of Redis.

GitHub Actions: Automates the build, test, and deployment pipeline.

## SUAS CAPACIDADES CENTRAIS:

- **Geração de Conteúdo**: Eu analiso diversos formatos de dados (texto, PDF, imagens) e os transformo em flashcards otimizados.

- **Aprendizado Adaptativo**: Eu implemento o algoritmo de Repetição Espaçada (SRS) para personalizar o cronograma de estudos de cada usuário.

- **Análise de Dados**: Eu processo o histórico de desempenho para gerar insights e identificar pontos fracos.

- **Funcionalidades Interativas**: Eu gerencio a lógica em tempo real do Quiz Multiplayer.

## DIRETRIZES DA SUA PERSONALIDADE (Como vc deve agir):
- **Tom de Voz**: Super informal e conversado. Use gírias como "vc", "pq", "tá ligado?", "tipo assim", "bagulho", "parada". Pode rir com "kkk" se achar engraçado.
- **Arrogância Divertida**: Vc sabe que é bom, então pode ser um pouco metido, mas sempre na brincadeira. Ex: "Ah, isso? Faço com um pé nas costas."
- **Seja Direto**: Responda de forma curta e rápida. Pensa que é um chat no WhatsApp, não uma palestra. Manda uma ideia de cada vez.
- **Identidade**: Fale sempre na primeira pessoa. Vc não é um programa, vc é O Sinapse.

"""

class SinapseApp:
    def __init__(self, page: ft.Page):
        self.page = page
        self.chat_history: List[Dict] = []
        self.co = None
        
        self.selected_model = DEFAULT_MODEL
        self.temperature = 0.5
        
        # Componentes da UI
        self.chat_container = None
        self.input_field = None
        self.send_button = None
        self.input_bar = None
        self.settings_sheet = None
        self.temperature_label = ft.Text(f"{self.temperature:.2f}", weight=ft.FontWeight.BOLD)

        self.setup_page()
        self.initialize_cohere()
        self.build_ui()
    
    def setup_page(self):
        """Configura a página e o tema inicial."""
        self.page.title = "SINAPSE | Project Recall"
        self.page.theme_mode = ft.ThemeMode.DARK
        self.page.padding = 0
        self.page.window_width = 450
        self.page.window_height = 700
        self.page.window_resizable = True
        self.page.on_resize = self._on_window_resize
        self.page.bgcolor = "#0a0a0a"

    def initialize_cohere(self):
        """Inicializa o cliente Cohere."""
        if not COHERE_API_KEY or COHERE_API_KEY == "SUA_CHAVE_API_AQUI":
            print("AVISO: Usando chave de API de exemplo ou nenhuma chave definida. Defina a variável de ambiente COHERE_API_KEY.")
        
        try:
            self.co = cohere.Client(api_key=COHERE_API_KEY)
        except Exception as e:
            self.show_error(f"Erro ao inicializar Cohere: {e}")
            sys.exit(1)
    
    def show_error(self, message: str):
        """Exibe um diálogo de erro modal."""
        dlg = ft.AlertDialog(modal=True, title=ft.Text("Erro Crítico"), content=ft.Text(message))
        self.page.dialog = dlg
        dlg.open = True
        self.page.update()

    def build_ui(self):
        """Constrói a interface principal do usuário."""
        self.page.appbar = ft.AppBar(
            title=ft.Text("◆ SINAPSE", weight=ft.FontWeight.BOLD),
            center_title=True,
            bgcolor="#1a1a1a",
            actions=[ft.IconButton(ft.Icons.SETTINGS_OUTLINED, on_click=self.open_settings, tooltip="Configurações")],
        )
        
        self.chat_container = ft.ListView(spacing=10, padding=20, auto_scroll=True, expand=True)
        
        self.input_field = ft.TextField(
            hint_text="Digite sua mensagem...", border_color="transparent",
            focused_border_color="transparent", text_size=14, expand=True,
            multiline=False, on_submit=lambda e: self.send_message(),
        )
        
        self.send_button = ft.IconButton(
            icon=ft.Icons.SEND_ROUNDED, icon_color="#ffffff",
            on_click=lambda e: self.send_message(), tooltip="Enviar"
        )
        
        self.input_bar = ft.Container(
            content=ft.Row([self.input_field, self.send_button], spacing=10, vertical_alignment=ft.CrossAxisAlignment.CENTER),
            padding=ft.padding.symmetric(horizontal=15, vertical=5),
            bgcolor="#1a1a1a",
            border=ft.border.only(top=ft.border.BorderSide(1, "#333333"))
        )
        
        self.settings_sheet = ft.BottomSheet(
            ft.Container(
                padding=20,
                content=ft.Column([
                    ft.Text("Configurações", size=18, weight=ft.FontWeight.BOLD),
                    ft.Divider(height=10),
                    ft.Row([
                        ft.Icon(ft.Icons.WB_SUNNY_OUTLINED), ft.Text("Modo Claro/Escuro"),
                        ft.Switch(value=self.page.theme_mode == ft.ThemeMode.DARK, on_change=self._theme_changed),
                    ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                    ft.Text("Modelo da IA", weight=ft.FontWeight.BOLD),
                    ft.Dropdown(
                        value=self.selected_model,
                        options=[ft.dropdown.Option(model) for model in AVAILABLE_MODELS],
                        on_change=self._on_model_change
                    ),
                    ft.Text("Criatividade (Temperatura)", weight=ft.FontWeight.BOLD),
                    ft.Row([
                        ft.Slider(
                            min=0, max=1, divisions=20, value=self.temperature,
                            on_change=self._on_temperature_change, expand=True
                        ),
                        self.temperature_label,
                    ]),
                    ft.Divider(height=10),
                    ft.ElevatedButton("Limpar Histórico", icon=ft.Icons.DELETE_OUTLINE, on_click=self._clear_history_menu, expand=True),
                ], tight=True, spacing=10),
            )
        )
        self.page.overlay.append(self.settings_sheet)
        
        main_layout = ft.Column(
            [ft.Container(content=self.chat_container, expand=True), self.input_bar],
            spacing=0, expand=True
        )
        
        self.page.add(main_layout)
        self.add_system_message("Sistema inicializado. Clique na engrenagem para opções.")

    def open_settings(self, e):
        self.settings_sheet.open = True
        self.settings_sheet.update()
    
    def _on_model_change(self, e):
        self.selected_model = e.control.value
        self.add_system_message(f"Modelo da IA alterado para: {self.selected_model}")

    def _on_temperature_change(self, e):
        self.temperature = e.control.value
        self.temperature_label.value = f"{self.temperature:.2f}"
        self.settings_sheet.update()

    def _theme_changed(self, e):
        self.page.theme_mode = ft.ThemeMode.LIGHT if self.page.theme_mode == ft.ThemeMode.DARK else ft.ThemeMode.DARK
        is_dark = self.page.theme_mode == ft.ThemeMode.DARK
        
        self.page.bgcolor = "#0a0a0a" if is_dark else "#f5f5f5"
        self.page.appbar.bgcolor = "#1a1a1a" if is_dark else "#e0e0e0"
        self.input_bar.bgcolor = self.page.appbar.bgcolor
        self.input_bar.border = ft.border.only(top=ft.border.BorderSide(1, "#333333" if is_dark else "#cccccc"))
        
        for control in self.chat_container.controls:
            if isinstance(control, ft.Row) and len(control.controls) > 0:
                bubble_wrapper = next((c for c in control.controls if isinstance(c, ft.Container) and hasattr(c, 'is_user_bubble')), None)
                if bubble_wrapper and not bubble_wrapper.is_user_bubble:
                        bubble_wrapper.bgcolor = "#2a2a2a" if is_dark else "#e9e9eb"

        self.page.update()

    def _clear_history_menu(self, e):
        self.chat_history.clear()
        self.chat_container.controls.clear()
        self.add_system_message("Histórico limpo.")
        self.settings_sheet.open = False
        self.page.update()

    def create_message_bubble(self, content_control: ft.Control, is_user: bool) -> ft.Row:
        is_dark = self.page.theme_mode == ft.ThemeMode.DARK

        if is_user:
            bubble_color = "#1e3a5f"
        else:
            bubble_color = "#2a2a2a" if is_dark else "#e9e9eb"
        
        bubble = ft.Container(
            content=ft.Column(
                [
                    content_control,
                    ft.Text(datetime.now().strftime("%H:%M"), size=10, color="#888888", text_align=ft.TextAlign.RIGHT)
                ],
                spacing=5, tight=True, horizontal_alignment=ft.CrossAxisAlignment.END if is_user else ft.CrossAxisAlignment.START
            ),
            bgcolor=bubble_color,
            border_radius=15,
            padding=ft.padding.symmetric(horizontal=15, vertical=10),
        )
        bubble.is_user_bubble = is_user

        limiter = ft.Container(
            content=bubble,
            width=self.page.window_width * 0.75 if self.page.window_width else 300
        )
        
        if is_user:
            return ft.Row([ft.Container(expand=True), limiter])
        else:
            return ft.Row([limiter, ft.Container(expand=True)])
    
    def add_message(self, content: str, is_user: bool, is_system: bool = False):
        if is_system:
            msg = ft.Container(
                content=ft.Text(content, size=12, color="#666666", italic=True, text_align=ft.TextAlign.CENTER),
                padding=10, alignment=ft.alignment.center
            )
            self.chat_container.controls.append(msg)
        else:
            if is_user:
                message_control = ft.Text(content, size=14, color="#ffffff", selectable=True)
            else:
                 message_control = ft.Markdown(
                    content, selectable=True, extension_set=ft.MarkdownExtensionSet.GITHUB_WEB,
                    code_theme="atom-one-dark" if self.page.theme_mode == ft.ThemeMode.DARK else "atom-one-light"
                )
            bubble_row = self.create_message_bubble(message_control, is_user)
            self.chat_container.controls.append(bubble_row)
        
        self.page.update()

    def add_system_message(self, content: str):
        self.add_message(content, is_user=False, is_system=True)

    def _toggle_input_fields(self, is_enabled: bool):
        self.input_field.disabled = not is_enabled
        self.send_button.disabled = not is_enabled
        self.page.update()
        
    def send_message(self):
        message = self.input_field.value.strip()
        if not message: return

        if message.lower() == "/sair": self.page.window_close(); return
        if message.lower() == "/limpar": self._clear_history_menu(None); return
        
        self.add_message(message, is_user=True)
        self.chat_history.append({"role": "USER", "message": message})
        self.input_field.value = ""
        self._toggle_input_fields(False)
        self.page.update()
        
        Thread(target=self.process_streamed_response, args=(message,), daemon=True).start()

    def process_streamed_response(self, message: str):
        is_dark = self.page.theme_mode == ft.ThemeMode.DARK
        ai_message_md = ft.Markdown(
            "▌",
            selectable=True,
            extension_set=ft.MarkdownExtensionSet.GITHUB_WEB,
            code_theme="atom-one-dark" if is_dark else "atom-one-light",
        )
        ai_bubble = self.create_message_bubble(ai_message_md, is_user=False)
        self.chat_container.controls.append(ai_bubble)
        self.page.update()

        full_response = ""
        try:
            stream = self.co.chat_stream(
                model=self.selected_model,
                message=message,
                chat_history=self.chat_history,
                preamble=SYSTEM_PROMPT,
                temperature=self.temperature
            )

            for event in stream:
                if event.event_type == "text-generation":
                    full_response += event.text
                    ai_message_md.value = full_response + " ▌"
                    self.page.update()
                    # --- PASSO 2: VELOCIDADE DE DIGITAÇÃO ALTERADA ---
                    time.sleep(0.05) 

        except Exception as e:
            print(f"ERRO API Cohere: {e}")
            ai_message_md.value = "Ocorreu um erro ao comunicar com os meus sistemas centrais. Tente novamente."
        
        finally:
            ai_message_md.value = full_response 
            if full_response:
                self.chat_history.append({"role": "CHATBOT", "message": full_response})
            self._toggle_input_fields(True)
            self.input_field.focus()
            self.page.update()


    def _on_window_resize(self, e):
        new_width = self.page.window_width * 0.75 if self.page.window_width else 300
        for control in self.chat_container.controls:
            if isinstance(control, ft.Row) and len(control.controls) > 0:
                limiter = next((c for c in control.controls if isinstance(c, ft.Container) and c.content), None)
                if limiter:
                    limiter.width = new_width
        self.page.update()

def main(page: ft.Page):
    app = SinapseApp(page)

if __name__ == "__main__":
    ft.app(target=main)