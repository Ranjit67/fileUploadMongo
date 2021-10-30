import { useState } from "react";

export default function File() {
  const [file, setFile] = useState();
  const [uplodedFile, setUplodedFile] = useState();
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // formData.append("name", "John");
      // console.log(file);
      formData.append("image", file);

      const fetchData = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });
      const res = await fetchData.json();
      if (fetchData.status === 200) {
        console.log(res);
        setUplodedFile(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fileHandler = (e) => {
    setFile(e.target.files[0]);
  };
  return (
    <div className="App">
      <img
        src={uplodedFile}
        alt=""
        style={{
          height: 100,
          width: 100,
        }}
      />
      <iframe src={uplodedFile} />
      <form onSubmit={submitHandler}>
        <input type="file" onChange={fileHandler} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
