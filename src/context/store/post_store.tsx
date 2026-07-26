import { create } from "zustand";

type PostTypes = {
  id: string;
  day: Date;
  block: {
    _id: string;
    start_time: string;
    end_time: string;
    timezone: string;
    num_players: number;
    current_player_list: string[];
    post: {
      _id: string;
      total_player_needed: number;
      likes: number;
      joinable: boolean;
      post_text: string;
      is_default_post: boolean;
      comment: string[];
      sport_type: string;
    };
    users_info: [
      {
        unique_user_ID: string;
        imageUrl?: string;
      },
    ];
    hall_info: {
      hall_details: {
        hall_name: string;
      };
    };
  };
};

type PostState = {
  postDetails: PostTypes | null;
  setPostDetails: (data: PostTypes) => void;
  clearPostDetails: () => void;
};
export const usePostStore = create<PostState>((set) => ({
  postDetails: null,
  setPostDetails: (data) => set({ postDetails: data }),
  clearPostDetails: () => set({ postDetails: null }),
}));
