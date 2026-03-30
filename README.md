# 📦 Estoque TI

Sistema completo para gestão de estoque de equipamentos de TI, com automações e integração com chatbot.

---

## 🚀 Sobre o projeto

O **Estoque TI** é uma aplicação desenvolvida para centralizar o controle de ativos de tecnologia, permitindo o gerenciamento eficiente de equipamentos e automação de processos.

Além do controle de estoque, o sistema conta com integrações externas para otimizar fluxos operacionais, como notificações e automações via chatbot.

---

## 🧠 Funcionalidades

* 📥 Cadastro e gerenciamento de produtos
* 📤 Controle de saída de equipamentos
* 🏷️ Filtro por marca e categorias
* 📊 Geração de relatórios (Excel)
* 🤖 Integração com chatbot (Telegram via n8n)
* 🔄 Automação de processos
* 📡 Integração com banco de dados

---

## 🛠️ Tecnologias utilizadas

* **Next.js**
* **React**
* **Node.js**
* **Supabase**
* **n8n**
* **TypeScript**
* **PostCSS**

---

## 📁 Estrutura do projeto

```bash
.
├── app/            # Rotas e páginas (Next.js)
├── components/     # Componentes reutilizáveis
├── contexts/       # Context API / estados globais
├── services/       # Integrações e regras de negócio
├── lib/            # Utilitários
├── public/         # Arquivos estáticos
├── estoque_ti/     # (verificar - possível duplicação)
```

---

## ⚙️ Integrações

* 🤖 Chatbot Telegram via n8n
* 🗄️ Banco de dados via Supabase
* 📄 Exportação de dados em Excel

---

## ▶️ Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/FilippeHarnack/estoque_ti.git
```

---

### 2. Instalar dependências

```bash
npm install
```

---

### 3. Rodar o projeto

```bash
npm run dev
```

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 📌 Melhorias futuras

* [ ] Sistema de autenticação
* [ ] Dashboard com métricas avançadas
* [ ] Controle de permissões por usuário
* [ ] Notificações em tempo real
* [ ] Melhorias na UI/UX



## 👨‍💻 Autor

Desenvolvido por **Filippe Harnack**

---

## 📄 Licença

Este projeto está sob a licença MIT.
