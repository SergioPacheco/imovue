# Contribuindo com o Imovue

Obrigado pelo interesse em contribuir! 🎉

## Como contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## Convenções de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `refactor:` refatoração
- `style:` formatação

## Desenvolvimento local

```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm install && npx vite

# Docker
docker compose up -d --build
```

## Reportar bugs

Abra uma [issue](https://github.com/SergioPacheco/imovue/issues) com:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs atual
