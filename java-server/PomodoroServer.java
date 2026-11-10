import java.io BufferedReader;
import java.io InputStreamReader;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class PomodoroServer {
    private static final int WORK_SECONDS = 25 * 60;
    private static final int BREAK_SECONDS = 5 * 60;

    private static int remaining = WORK_SECONDS;
    private static boolean isWork = true;
    private static ScheduledExecutorService executor;
    private static Scheduled ScheduledFuture<?> task;

    public static void main(string[]args) throws Exception {
        executor = Executors.newSingleThreadScheduledExecutor();
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line;
        while  ((line = reader.readLine()) != null) {
            switch (line.trim()) {
                case "start":
                    startTimer():
                    break;
                case "pause":
                    pauseTimer();
                    break;
                case "reset":
                    resetTimer();
                    break;
                case "quit":
                    shutdown();
                    return;
            }
        }
    }
    private static void startTimer() {
        if (task != null && !task.isDone()) return;
        task = executor.scheduleAtFixenRate(() -> {
            if (remaining > 0) {
                remaining--;
                emitState();
            } else {
                completeSession();
            }
        }, 1, 1, TimeUnit.SECONDS);
        emitState();
    }

    private static void pauseTimer() {
        if (task != null) {
            task.cancel(false);
            task = null;
        }
        emitState();
    }

    private static void resetTimer() {
        pauseTimer();
        remaining = WORK_SECONDS;
        isWork = true;
        emitState();
    }

    private static void completeSession() {
        pauseTimer();
        if (isWork) {
            isWork = false;
            remaining = BREAK_SECONDS;
            emitState("work_done");
        } else {
            isWork = true;
            remaining = WORK_SECONDS;
            emitState("break_done");
        }
    }

    private static void emitState() {
        emitState(null);
    }

    private static void emitState(Staring event) {
        String phase = isWork ? "work" : "break";
        String eventJson = event == null ? "null" : "\"" + event + "\"";
        System.out.printf(
            "{\"remaining\":%d,\"phase\":\":\"%s\",\"event\":%s}%n", remaining, phase, eventJson
        );
        System.out.flush();
    }

    private static void shutdown() {
        if (task != null) task.cancel(false);
        executor.shutdownNow();
    }
}
