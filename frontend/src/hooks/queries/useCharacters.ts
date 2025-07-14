import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CharactersApi } from "@/api";
import type { Character, CreateCharacterDto, UpdateCharacterDto } from "@/api";

// クエリキー
const CHARACTER_QUERY_KEYS = {
  characters: ["characters"] as const,
  character: (id: number) => ["character", id] as const,
  search: (query: string) => ["characters", "search", query] as const,
} as const;

// キャラクター一覧取得
export const useCharacters = (userId?: string) => {
  return useQuery({
    queryKey: userId ? ["characters", userId] : CHARACTER_QUERY_KEYS.characters,
    queryFn: () =>
      userId
        ? CharactersApi.getCharactersByUserId(userId)
        : CharactersApi.getCharacters(),
    staleTime: 5 * 60 * 1000, // 5分間はフレッシュとみなす
  });
};

// キャラクター検索
export const useSearchCharacters = (query: string) => {
  return useQuery({
    queryKey: CHARACTER_QUERY_KEYS.search(query),
    queryFn: () => CharactersApi.searchCharacters(query),
    enabled: !!query && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1分間はフレッシュとみなす
  });
};

// キャラクター作成ミューテーション
export const useCreateCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCharacterDto) =>
      CharactersApi.createCharacter(data),
    onSuccess: (newCharacter) => {
      // キャラクター一覧のキャッシュに新しいキャラクターを追加
      queryClient.setQueryData(
        CHARACTER_QUERY_KEYS.characters,
        (oldCharacters: Character[] | undefined) => {
          if (!oldCharacters) return [newCharacter];
          return [newCharacter, ...oldCharacters];
        },
      );

      // 全てのキャラクター関連キャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["characters"],
      });
    },
  });
};

// キャラクター更新ミューテーション
export const useUpdateCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCharacterDto }) =>
      CharactersApi.updateCharacter(id, data),
    onSuccess: (updatedCharacter) => {
      // 特定のキャラクターキャッシュを更新
      queryClient.setQueryData(
        CHARACTER_QUERY_KEYS.character(updatedCharacter.id),
        updatedCharacter,
      );

      // キャラクター一覧のキャッシュを更新
      queryClient.setQueryData(
        CHARACTER_QUERY_KEYS.characters,
        (oldCharacters: Character[] | undefined) => {
          return oldCharacters?.map((character) =>
            character.id === updatedCharacter.id ? updatedCharacter : character,
          );
        },
      );

      // 関連キャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["characters"],
      });

      // キャラクター名が変更された場合、関連するPostsキャッシュも無効化
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });
};

// キャラクター削除ミューテーション
export const useDeleteCharacter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CharactersApi.deleteCharacter(id),
    onSuccess: (_, deletedId) => {
      // キャラクター一覧のキャッシュから削除
      queryClient.setQueryData(
        CHARACTER_QUERY_KEYS.characters,
        (oldCharacters: Character[] | undefined) => {
          return oldCharacters?.filter(
            (character) => character.id !== deletedId,
          );
        },
      );

      // 特定のキャラクターキャッシュを削除
      queryClient.removeQueries({
        queryKey: CHARACTER_QUERY_KEYS.character(deletedId),
      });

      // キャラクター一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["characters"],
      });
    },
  });
};
