# Використовуємо офіційний образ Ubuntu
FROM ubuntu:20.04

# Встановлюємо необхідні пакети
RUN apt-get update && apt-get install -y curl unzip

# Встановлюємо Bun
RUN curl -fsSL https://bun.sh/install | bash

# Додаємо Bun до PATH
ENV BUN_INSTALL="/root/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

# Створимо робочу директорію
WORKDIR /app

# Копіюємо файли package.json та bun.lockb та встановлюємо залежності
COPY bun.lockb package.json ./
RUN bun install

# Копіюємо вихідні файли проекту
COPY . .

# Відкриваємо порт
EXPOSE 3000

# Запускаємо сервер
CMD ["bun", "run", "server.ts"]
