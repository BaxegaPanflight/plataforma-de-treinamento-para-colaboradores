## Diagnóstico

Em `src/routes/_admin/admin.cargos.tsx` a query de cursos do select de "Adicionar curso à trilha" filtra apenas `publicado = true`:

```ts
supabase.from("courses").select("id, titulo, nr_codigo")
  .eq("publicado", true).order("titulo")
```

Estado atual do banco: 8 cursos cadastrados, **apenas 1 publicado**. Os 7 que o usuário acabou de criar (incluindo "Novo curso", "NR 10", "NR10") **não aparecem** no select da trilha — por isso a construção "quebra no meio": dá pra criar o cargo, mas não dá pra anexar os cursos recém-criados.

Além disso, se nenhum curso adicionável existir, o bloco inteiro de adição (`availableCourses.length > 0`) some sem mensagem, agravando a sensação de tela quebrada.

## Mudanças (somente em `src/routes/_admin/admin.cargos.tsx`)

1. **Remover o filtro `.eq("publicado", true)`** ao carregar `courses`. Staff (admin) é quem usa essa tela e a RLS já permite ver todos. Acrescentar `publicado` ao `select` e ao tipo `CourseLite`.

2. **Sinalizar visualmente cursos não publicados** no `SelectItem` e no card da trilha — badge "Rascunho" + texto secundário "Não publicado — alunos não verão até publicar".

3. **Mensagem quando não há cursos adicionáveis**: substituir o `availableCourses.length > 0 &&` por bloco com fallback mostrando "Todos os cursos já estão nesta trilha. Crie novos cursos em Cursos." (com `<Link to="/admin/cursos">`).

4. **Mensagem quando não há cursos no sistema**: se `courses.length === 0`, mostrar CTA para criar curso antes de montar a trilha.

5. **Aviso de cobertura**: na seção "Cobertura de NRs", separar NRs cobertas por cursos publicados vs. rascunho, deixando claro que a trilha só fica efetiva quando os cursos estiverem publicados.

## Fora de escopo
- Não mexer no fluxo de criação/edição de cargo (funcionando).
- Não mexer no botão "Sugerir com IA" (edge function `suggest-trail` existe e segue como está).
- Sem alterações de schema/RLS — `path_requirements` aceita qualquer `course_id` de staff.
