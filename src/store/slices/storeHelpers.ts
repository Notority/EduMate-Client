export function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || fallback;
}

export async function withLoading(set: any, task: () => Promise<any>, fallback: string) {
  set({ isLoading: true, error: null });
  try {
    const result = await task();
    set({ isLoading: false });
    return result;
  } catch (error: any) {
    const message = getErrorMessage(error, fallback);
    set({ error: message, isLoading: false });
    throw new Error(message);
  }
}
