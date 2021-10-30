import React from "react";
import {
  useGetAllPostQuery,
  useGetPostByIdQuery,
  useGetLimitDataQuery,
  useDeleteDataMutation,
  useCreatePostMutation,
} from "../services/post";

export default function Redux() {
  const response = useGetAllPostQuery();
  const limitData = useGetLimitDataQuery(4);
  const otherById = useGetPostByIdQuery(32);
  const [deletePost, deleteRespon] = useDeleteDataMutation();
  const [createPOST, CREATEpOSTrESPONSE] = useCreatePostMutation();
  console.log("CREATEpOSTrESPONSE", CREATEpOSTrESPONSE);
  const postCreate = () => {
    createPOST({
      title: "ranjit",
      body: "rest",
      userId: 1,
    });
  };
  return (
    <div>
      redux enviorment
      <div>
        <button
          onClick={() => {
            deletePost(2);
          }}
        >
          Delete
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            postCreate();
          }}
        >
          CREATE POST
        </button>
      </div>
    </div>
  );
}
