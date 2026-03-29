import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Media, MediaFolder } from "@/shared/schema";

const API_BASE = "/api/v1/media";

export function useMedia(folderId?: number) {
  const queryClient = useQueryClient();

  const mediaQuery = useQuery<Media[]>({
    queryKey: ["media", folderId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}${folderId ? `?folderId=${folderId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
  });

  const foldersQuery = useQuery<MediaFolder[]>({
    queryKey: ["media-folders", folderId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/folders${folderId ? `?parentId=${folderId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, folderId, altText }: { file: File; folderId?: number; altText?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (folderId) formData.append("folderId", folderId.toString());
      if (altText) formData.append("altText", altText);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId?: number }) => {
      const res = await fetch(`${API_BASE}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete media");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  return {
    media: mediaQuery.data || [],
    folders: foldersQuery.data || [],
    isLoading: mediaQuery.isLoading || foldersQuery.isLoading,
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    createFolder: createFolderMutation.mutateAsync,
    deleteMedia: deleteMediaMutation.mutateAsync,
  };
}
