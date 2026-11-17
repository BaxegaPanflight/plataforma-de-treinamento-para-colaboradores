# Schema export — 2026-11-17

Baseline SQL exportada dos catálogos do PostgreSQL em `supabase/migrations`, sem executar mudanças no banco atual.

## Conteúdo e ordem

1. `20261117014700_schema_tables.sql`: 4 enums, 1 sequência, 37 tabelas, defaults, nulabilidade, permissões e ativação de RLS.
2. `20261117014701_schema_constraints.sql`: 114 constraints (chaves primárias, únicas, estrangeiras e CHECKs). Não havia índices independentes de constraints.
3. `20261117014702_schema_functions.sql`: 23 funções, incluindo funções de trigger.
4. `20261117014703_schema_policies_triggers_view.sql`: 91 políticas RLS (73 da aplicação e 18 de arquivos), 8 triggers e a view `vw_compliance`.
5. `20261117014704_schema_grants.sql`: permissões existentes de `PUBLIC`, `anon`, `authenticated` e `service_role`, inclusive funções, sequência e view.

## Uso e limites

- Aplicar em **um banco novo**, na ordem dos nomes. Não executar no banco atual: os objetos já existem. Esta baseline não é incremental nem idempotente.
- Exige ambiente gerenciado com `auth`, `storage`, `extensions` e `vault`, funções de autenticação, papéis da plataforma e usuário de administração.
- Exige `gen_random_uuid()` e `supabase_vault` para as funções existentes de segredos. Outras extensões instaladas na origem: `pg_cron`, `pg_net`, `pg_stat_statements`, `pgcrypto`, `plpgsql` e `uuid-ossp`; estruturas internas não foram exportadas.
- Configurar os buckets `branding`, `certificates`, `course-assets`, `lesson-files` e `public` separadamente. Inclui as políticas de `storage.objects`, não os buckets nem seus arquivos.
- Preserva as regras e permissões existentes, inclusive acessos amplos e funções `SECURITY DEFINER`. A exportação **não é uma revisão de segurança**. As referências existentes a `auth.users` foram preservadas.
- `handle_new_user` existe, mas não havia trigger da aplicação em `auth.users` na exportação; nenhum trigger ausente foi inventado.
- Não inclui dados, usuários/senhas, valores de segredos, estado corrente da sequência, configurações de autenticação, estruturas internas gerenciadas ou papéis internos. Grants de `sandbox_exec` foram omitidos por não serem portáveis.
- Grants acompanham cada `CREATE TABLE`, antes de RLS, e reaparecem no último arquivo para incluir os demais objetos. Nenhum privilégio novo foi inventado.
- Não havia comentários de objetos nem associação `OWNED BY` da sequência nos catálogos consultados.

## Validação

Todos os cinco arquivos foram analisados por um parser PostgreSQL. Contagens de tabelas, funções, políticas, triggers e constraints conferidas contra os catálogos de origem. Não houve aplicação em um banco novo, portanto restauração operacional não foi verificada.

As migrations são uma exportação para controle de versão, não uma alteração de schema a aplicar ao banco em uso.