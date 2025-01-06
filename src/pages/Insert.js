import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import Header from "../components/Header";
import Footer from "../components/Footer";
import { supabase } from "../supabase";

const Insert = () => {
  const navigate = useNavigate(); // useNavigate 초기화
  const [ data, setData ] = useState({
    title:'',
    content:''
  })
  const [ file, setFile ] = useState(null);
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function InsertData(e){
    e.preventDefault();
    let thumbnailPath = null
    if(file){
      const uploadedFilePath = await uploadFile(file);
      if(uploadedFilePath){
        thumbnailPath = uploadedFilePath;
      }
    }
    const { error } = await supabase
      .from('projects')
      .insert({  title : data.title, content : data.content, thumbnail: thumbnailPath })

      // console.log(uploadedFilePa?th);

      if(error){
        alert('입력 실패');
        console.log(error);
      }else{
        alert('입력 성공');
        navigate('/');
      }
  }
  const handleChange = (e)=>{
    let {name, value} = e.target;
    setData({
      ...data,
      [name]:value
    })
  }
  const handleFileChange = (e)=>{
    const attachFile = e.target.files[0];
    setFile(attachFile);
  }
  const handleSignOut = ()=>{
    supabase.auth.signOut();
    navigate('/');
  }
  // Upload file using standard upload
  async function uploadFile(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `thumbnail/${fileName}`
    const { data, error } = await supabase.storage.from('project').upload(filePath, file)
    if (error) {
      // Handle error
      alert('파일 업로드 실패');
      console.log(error);
    } else {
      // Handle success
      console.log(data);
      alert('파일 업로드 성공');
      return filePath;
    }
  }
  if (!session) {
    return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
  }
  else {
    return (
      <div>
        <Header />
        <main class="content">
          <div class="container about_content shadow">    
            <div class="form">
                <h3 class="heading6">프로젝트 입력</h3>
                <div class="contact_form">
                    <form action="" onSubmit={InsertData} method="post">
                        <p class="field">
                            <label for="title">Title:</label>
                            <input type="text" name="title" id="title" onChange={handleChange} placeholder="title"/>
                        </p>
                        <p class="field">
                            <label for="content">Content:</label>
                            <textarea name="content" id="content" cols="30" rows="10" onChange={handleChange} placeholder="content"></textarea>
                        </p>
                        <p class="field">
                            <label for="file">Available Budget:</label>
                            <input type="file" name="thumbnail" onChange={handleFileChange} />
                        </p>
                        <p class="submit">
                            <input type="submit"  class="primary-btn" value="입력"/>
                        </p>
                        <button type="button" onClick={handleSignOut}>로그아웃</button>
                    </form>
                </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
};

export default Insert;
