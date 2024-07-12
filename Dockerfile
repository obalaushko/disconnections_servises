FROM jarredsumner/bun:latest

WORKDIR /app

# Копіюємо package.json та встановлюємо залежності
COPY bun.lockb package.json ./
RUN bun install

# Копіюємо вихідні файли проекту
COPY . .

# Відкриваємо порт
EXPOSE 3000

# Запускаємо сервер
CMD ["bun", "run", "server.ts"]
