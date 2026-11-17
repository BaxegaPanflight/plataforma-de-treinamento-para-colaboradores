# Plataforma de Treinamentos com IA

Crie uma plataforma LMS white-label profissional para treinamentos corporativos e compliance.

## Stack

React + Vite + TypeScript + Tailwind CSS + Supabase (Auth + Postgres + Storage)

## Design

Clean e profissional. Paleta base slate/zinc. Uma cor primária customizável (por hora use #2563EB). 

Sidebar colapsável no painel admin. Mobile-first no lado do aluno. Sem animações excessivas.

## Roles

- Admin: acesso total ao painel de gestão

- Gestor: gerencia cursos e alunos, sem acesso a configurações da plataforma

- Aluno: acessa catálogo, consome cursos, visualiza certificados

## Rotas a criar

### Públicas

- /login — email + senha + link "esqueci minha senha"

- /cadastro — somente alunos (nome completo, CPF, email, senha, confirmação)

- /convite/:token — gestor aceita convite e define senha

- /certificado/:token — página pública de validação de certificado

### Admin e Gestor (/admin/*)

- /admin/dashboard — métricas principais (cards + placeholder de gráfico)

- /admin/cursos — listagem com status publicado/rascunho, botão criar

- /admin/cursos/:id/editar — editor de curso (tabs: conteúdo, avaliação, configurações)

- /admin/alunos — listagem com status e progresso geral

- /admin/alunos/:id — perfil do aluno, cursos, certificados

- /admin/equipe — listagem de gestores, botão convidar

- /admin/relatorios — exportação CSV e PDF (placeholder)

- /admin/configuracoes — branding (logo, cor primária)

### Aluno (/aluno/*)

- /aluno/catalogo — grade de cursos disponíveis

- /aluno/meus-cursos — em andamento e concluídos com status de validade

- /aluno/curso/:id — player do curso (módulos, aulas, progresso)

- /aluno/certificados — certificados emitidos com status

## Schema Supabase (crie as migrations)

users: id, nome, email, cpf, role (admin|gestor|aluno), avatar_url, ativo, created_at

branding: id, logo_url, primary_color, domain, email_from (singleton — apenas 1 linha)

courses: id, titulo, descricao, capa_url, validade_meses, nota_minima, progresso_minimo_pct, emite_certificado, publicado, created_at

modules: id, course_id, titulo, ordem

lessons: id, module_id, titulo, tipo (panda|pdf|audio|slides|link|rich_text), ordem, obrigatoria

panda_lessons: lesson_id, panda_video_id, duracao_seg, thumbnail_url

file_lessons: lesson_id, storage_path, mime_type

link_lessons: lesson_id, url

rich_lessons: lesson_id, conteudo_html

questions: id, course_id, enunciado, nivel (facil|medio|dificil), ativo

alternatives: id, question_id, texto, correta

enrollments: id, user_id, course_id, status (ativo|expirando|vencido|concluido), due_date, enrolled_at

lesson_progress: id, enrollment_id, lesson_id, concluida, watch_pct, completed_at

attempts: id, enrollment_id, score, aprovado, ip, user_agent, course_version_hash, created_at

attempt_answers: id, attempt_id, question_id, alternative_id, correta

certificates: id, attempt_id, user_id, course_id, pdf_url, qr_token, emitido_at, expires_at

notifications: id, user_id, canal, template, payload_json, sent_at, status

audit_logs: id, user_id, acao, entidade, entidade_id, ip, payload_json, created_at

## RLS

Habilite RLS em todas as tabelas. Admin acessa tudo. Gestor acessa cursos, alunos e relatórios. Aluno acessa apenas seus próprios dados (enrollments, progress, attempts, certificates).

## Auth

- Email + senha (Supabase Auth)

- Confirmação de email obrigatória para alunos

- Recuperação de senha por email

- Convite de gestor: admin envia email com link /convite/:token, gestor define senha

## Estado inicial

Ao terminar, o projeto deve ter: todas as rotas funcionando com layouts corretos, sidebar do admin com navegação real, autenticação funcionando com redirect por role, e um curso de exemplo no seed.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bc334a91-e506-4ed8-8ed3-04e804f0a930).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
