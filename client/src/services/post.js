import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com/",
  }),
  endpoints: (builder) => ({
    getAllPost: builder.query({
      query: () => ({
        url: "posts",
        method: "GET",
      }),
    }),
    getPostById: builder.query({
      query: (id) => ({
        url: `posts/${id}`,
        method: "GET",
      }),
    }),
    getLimitData: builder.query({
      query: (id) => ({
        url: `posts?_limit=${id}`,
        method: "GET",
      }),
    }),
    deleteData: builder.mutation({
      query: (id) => ({
        url: `posts/${id}`,
        method: "DELETE",
      }),
    }),
    createPost: builder.mutation({
      query: (body) => ({
        url: `posts`,
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});
export const {
  useGetAllPostQuery,
  useGetPostByIdQuery,
  useGetLimitDataQuery,
  useDeleteDataMutation,
  useCreatePostMutation,
} = postApi;
