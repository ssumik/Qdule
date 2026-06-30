# N3 - Programação Web - 5º Semestre | Engenharia de Software | Católica SC

## Integrantes da equipe

- Ana Claudia Volkmann
- Gustavo Gabriel Paterno
- Gustavo Fontana
- Jean Carlos Menezes Cunha
- João Pedro Sumi Bebber

---

### Sitema: Qdule | Hanna Kupas - Estética Facial e Corporal

## Sobre a aplicação

O **Qdule** é um sistema de agendamento e gerenciamento de atendimentos desenvolvido para a profissional de estética **Hanna Kupas**. O objetivo da aplicação é centralizar e automatizar o processo de agendamento, que atualmente é realizado exclusivamente por meio do WhatsApp.

O sistema possui dois fluxos principais:

1. Agendamento de serviços (Cliente)
2. Painel Administrativo (Profissional)

---

# Fluxos do sistema

## 1. Agendamento de Serviços

Este é o fluxo principal utilizado pelos clientes para realizar um agendamento.

### Seleção do serviço

- Os serviços são exibidos em um carrossel, organizados por categorias.
- Também existe um campo de pesquisa para localizar rapidamente um procedimento.
- Ao selecionar um serviço, o cliente visualiza informações detalhadas e pode iniciar o agendamento.

### Escolha da data e horário

Após clicar em **Agendar**, no card do serviço selecionado:

- É exibido um calendário para seleção da data desejada.
- Ao selecionar uma data, os horários disponíveis são apresentados ao lado (ou abaixo, em dispositivos móveis).

### Cadastro do cliente

Ao prosseguir para o próximo passo, o cliente informa:

- Nome completo;
- E-mail (utilizado para confirmação do agendamento);
- Celular (para contato, caso necessário);
- Confirmação de consentimento referente às políticas de cancelamento.

### Confirmação do agendamento

Após concluir o cadastro:

- O sistema envia um e-mail de confirmação para o endereço informado;
- O cliente deve acessar o link presente no e-mail;
- Somente após essa confirmação o agendamento é efetivamente realizado.

---

### Cancelamento de agendamento

O e-mail de confirmação também contém um link para o WhatsApp da profissional.

Caso o cliente deseje cancelar o atendimento:

- entra em contato pelo WhatsApp;
- a profissional realiza o cancelamento através do painel administrativo;
- o cancelamento pode ocorrer com ou sem aplicação de taxas.

---

## 2. Painel Administrativo

Área de acesso exclusivo da profissional, protegida por autenticação.

Após realizar o login, a tela inicial exibida é **Acompanhamento**.

A navegação ocorre:

- pelo menu lateral (Desktop);
- pelo menu superior (Mobile).

---

### Acompanhamento

Permite acompanhar os atendimentos agendados.

Funcionalidades:

- Visualização da quantidade de agendamentos do dia;
- Visualização da quantidade de agendamentos da semana;
- Calendário com indicação dos dias que possuem atendimentos;
- Consulta dos agendamentos de um dia específico;
- Visualização completa dos dados cadastrados pelo cliente;
- Cancelamento de agendamentos quando solicitado pelo cliente.

---

### Configuração de Horários

Permite definir os horários de funcionamento padrão.

É possível:

- Ativar ou desativar dias da semana;
- Cadastrar intervalos de atendimento;
- Excluir intervalos;
- Definir horários recorrentes.

#### Regras

- Todos os dias devem possuir pelo menos um intervalo antes de salvar.
- O sistema impede a criação de intervalos sobrepostos.

#### Exceções

##### Folga

1. Adicionar exceção;
2. Selecionar **Folga**;
3. Escolher a data;
4. Salvar.

##### Horário especial

Permite configurar um horário diferente apenas para um dia específico, sem alterar a agenda padrão.

Passos:

1. Adicionar exceção;
2. Selecionar **Horário Especial**;
3. Escolher a data;
4. Definir horário inicial e final;
5. Cadastrar intervalos (opcional);
6. Salvar.

---

### Serviços

Permite cadastrar os procedimentos exibidos aos clientes.

#### Cadastrar

1. Clicar em **+ Novo Serviço**;
2. Preencher os campos obrigatórios;
3. Confirmar o cadastro.

#### Editar

1. Selecionar **Editar**;
2. Alterar os campos desejados;
3. Salvar as alterações.

#### Excluir

1. Selecionar **Excluir**;
2. Confirmar a exclusão.

> **Observação:** um serviço somente pode ser excluído caso não existam agendamentos ativos vinculados a ele. Recomenda-se apenas desativá-lo.

---

## Relacionamento entre os CRUDs

> **(Adicionar aqui como os CRUDs se relacionam.)**

Exemplo:

- Serviços ↔ Agendamentos
- Clientes ↔ Agendamentos
- Horários ↔ Agenda
- Usuário Administrador ↔ Configurações

---

# Stack utilizada

- Vite
- React
- shadcn/ui
- Java
- Quarkus
- Neon (PostgreSQL)
- Supabase Storage (armazenamento de imagens por URL)
- Resend (envio de e-mails)

---

# Passo a passo para execução do projeto

1.
2.
3.
4.

---

# Credenciais padrão

**Painel Administrativo**

- **E-mail:** `admin@qdule.com`
- **Senha:** `admin`