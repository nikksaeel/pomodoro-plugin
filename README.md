# pomodoro-plugin for VS Code

Плагин для Visual Studio Code, реализующий таймер Pomodoro (работа/отдых). 
Проект использует гибридную архитектуру: клиентская часть (UI) написана на TypeScript, а логика подсчета времени вынесена в отдельный Java-сервер.

## Возможности
- **Таймер в статус-баре**: отображение оставшегося времени прямо в нижней панели VS Code.
- **Webview-панель**: удобный интерфейс с кнопками «Старт» и «Сброс» в боковой панели Activity Bar.
- **Уведомления**: всплывающие сообщения о завершении рабочей сессии или перерыва.
- **Настройка времени**: возможность менять длительность работы и отдыха через настройки VS Code.

## Требования и установка зависимостей

Для работы плагина требуются **Java (JDK 17+)** и **Node.js (18+)**. 
Ниже приведены инструкции для разных операционных систем.

### Для Windows (без WSL)
1. **Установка Java**:
   - Скачайте установщик **JDK** (например, [Eclipse Temurin](https://adoptium.net/)) и установите его.
   - Во время установки обязательно отметьте галочку **"Set JAVA_HOME variable"** и **"Add to PATH"**.
   - Проверьте в командной строке (`cmd`): `java -version`.
2. **Установка Node.js**:
   - Скачайте и установите [Node.js](https://nodejs.org/) (LTS версию).
   - Проверьте в командной строке: `node -v` и `npm -v`.

### Для macOS
1. **Установка Java**:
   - Если у вас есть [Homebrew](https://brew.sh/), выполните: `brew install openjdk@17`.
   - Или скачайте установщик с [Adoptium](https://adoptium.net/).
2. **Установка Node.js**:
   - Через Homebrew: `brew install node`.

### Для Ubuntu / WSL (Linux)
```bash
sudo apt update
sudo apt install default-jdk nodejs npm -y
```

## Установка и запуск (для разработки)
1. Склонируйте репозиторий и перейдите в папку проекта:
   ```bash
   cd pomodoro-plugin
2. Откройте встроенный терминал (Ctrl + ~ или в меню Terminal -> New Terminal)
3. Установите зависимости Node.js
```bash
npm install
```
4. Соберите Java-сервер (создатся файл pomodoro-server.jar)
```bash
cd java-server
javac PomodoroServer.java
jar cfe pomodoro-server.jar PomodoroServer PomodoroServer.class
cd ..
```
5. Скомпилируйте TypeScript-клиент
```bash
npx tsc -p ./
```
6. Запустите плагин: нажмите клавишу F5 (или перейдите во вкладку "Run and Debug" слева и нажмите зеленую кнопку Play). Откроется новое окно VS Code (Extension Development Host) с уже загруженным плагином.

7. В новом окне нажмите Ctrl+Shift+P (Палитра команд), введите Pomodoro: Start / Pause и нажмите Enter.

8. Смотрите в правый нижний угол экрана (статус-бар) — таймер начал отсчет! Также плагин доступен в левой панели (иконка таймера).

