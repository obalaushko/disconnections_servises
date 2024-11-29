# Використовуємо офіційний образ Node.js з Puppeteer
FROM node:18-bullseye-slim

# Оновлюємо пакети та встановлюємо необхідні залежності
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libx11-xcb1 \
    libx11-6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Встановлюємо Bun
RUN curl -fsSL https://bun.sh/install | bash

# Додаємо Bun до PATH
ENV BUN_INSTALL="/root/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

# Створюємо робочу директорію
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
