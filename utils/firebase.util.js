const {initializeApp } = require('firebase/app')
const { getStorage ,ref ,uploadBytes ,getDownloadURL } = require('firebase/storage')

const dotenv = require('dotenv')
//model
const {PostImg}= require('../models/postImg.model')

dotenv.config({path:'./config.env'})

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	appId: process.env.FIREBASE_APP_ID,
  };

const firebaseApp =  initializeApp(firebaseConfig)
// storage service
const storage = getStorage(firebaseApp)

const uploadPostImgs = async (imgs , postId) => {
	// map async -> async opertions with arrays
	const imgsPromises = imgs.map(async img => {
		//create firebase reference
		const [originalName, ext] = img.originalname.split('.'); // -> [pug, jpg]
	
		const filename = `post/${postId}/${originalName}-${Date.now()}.${ext}`;
		const imgRef = ref(storage, filename);
	
		//upload image to firebase
		const result = await uploadBytes(imgRef, img.buffer);
	
		await PostImg.create({
		  postId,
		  imgUrl: result.metadata.fullPath,
		});
	  });
    
	  await Promise.all(imgsPromises)
}

const getPostImgsUrls = async postnew =>{
   //loop trough post to get to the Postimgs
  const postWithImgsPromises = postnew.map(async (post) => {
    //Get img URLs
    const postImgsPromises = post.postImgs.map(async (postImg) => {
      const imgRef = ref(storage, postImg.imgUrl);
      const imgUrl = await getDownloadURL(imgRef);

      postImg.imgUrl = imgUrl;
      return postImg; 
    });

	//Resolve imgs urls
    const postImgs = await Promise.all(postImgsPromises);
    
	//update old postImgs array with  new array
    post.postImgs = postImgs;
    return post;
  });

  return await Promise.all(postWithImgsPromises);

}

module.exports = {storage , uploadPostImgs , getPostImgsUrls}