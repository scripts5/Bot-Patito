type Task = () => void | Promise<void>;

interface ScheduledJob {
  name: string;
  intervalMs: number;
  handle: NodeJS.Timeout;
}

const jobs = new Map<string, ScheduledJob>();

export const schedulerService = {
  schedule(name: string, intervalMs: number, task: Task): void {
    if (jobs.has(name)) this.cancel(name);

    const handle = setInterval(() => {
      Promise.resolve(task()).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[schedulerService] Erro no job "${name}":`, err);
      });
    }, intervalMs);

    jobs.set(name, { name, intervalMs, handle });
  },

  cancel(name: string): void {
    const job = jobs.get(name);
    if (!job) return;
    clearInterval(job.handle);
    jobs.delete(name);
  },

  cancelAll(): void {
    for (const name of jobs.keys()) this.cancel(name);
  },
};
