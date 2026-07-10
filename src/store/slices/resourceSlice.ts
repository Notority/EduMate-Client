import { resourceApi } from '../../services/api';
import { withLoading } from './storeHelpers';

export const createResourceSlice = (set: any) => ({
  uploadResource: (fileUri: string, fileName: string, fileType: string, courseId?: number) => withLoading(set, async () => {
    const formData = new FormData();
    formData.append('file', { uri: fileUri, name: fileName, type: fileType } as any);
    if (courseId) formData.append('courseId', courseId.toString());
    await resourceApi.upload(formData);
    set({ resources: (await resourceApi.getAll()).data });
  }, 'Failed to upload file.'),
  getResources: () => withLoading(set, async () => {
    const { data } = await resourceApi.getAll();
    set({ resources: data });
    return data;
  }, 'Failed to load resources.'),
  deleteResource: (id: number) => withLoading(set, async () => {
    await resourceApi.delete(id);
    set({ resources: (await resourceApi.getAll()).data });
  }, 'Failed to delete resource.'),
});
