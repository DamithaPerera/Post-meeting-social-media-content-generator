export async function tryit<T>(p: Promise<T>): Promise<[Error | null, T | null]> {
  try { return [null, await p]; } catch (e:any) { return [e, null]; }
}
