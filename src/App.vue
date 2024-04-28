
<template>
  <div class="container">
  <nav>
    <h4>HEIC DATA CARVER v0.1 ~ Rishi Uttam</h4>
<h4>COMP3012HK ASSESSMENT 1 / PART C (28-APR-2024)</h4>

</nav>
  <main>
   
<h1>Add your .dd file</h1>


<input accept=".dd,.heic" type="file" id="file" ref="fileInput" name="file" @click="reset" @change="fileChanged" />

<div v-if="isSearching && !isDone">
  <progress></progress>
</div>
<div v-else-if="isDone" class="galleryContainer">

<div class="carvedHeader">

  <h3>Carved {{ images.length }} images. </h3>

<h4 v-if="!allFinished"><span>Loading <span>{{ currentImageProcessed }} </span> / <span> {{ images.length }} </span>   <img height="20px" src='./assets/spinner.gif'/></span></h4>


</div>


   <div class="imageContainer">
   <div class="childImageContainer" v-for="(image,index) in imageBlob" :key="image">

  <img class="image" :src="image" loading="eager" :key="image" alt="image" />
  
  <a  :key="image" :href="blobArray[index]">Download .heic</a>
</div>
</div>
<p style="color:red">{{ errorMessage }}</p>
</div>


  </main>
</div>
</template>

<script setup>

import { ref } from 'vue';
import MyWorker from './worker?worker'
import heic2any from 'heic2any';
const isSearching = ref(false);
const currentByte = ref(0)
const images = ref([]);
const imageBlob = ref([]);
const imageSliced = ref([]);
const imageUint8Array = ref(null);
const blobArray =ref([])
const isDone = ref(false)
const allFinished = ref(false);
const fileInput = ref(null);
const errorMessage = ref('');
const currentImageProcessed = ref(0);


const reset = () => {
  isDone.value = false
  images.value = []
  imageBlob.value = []
  imageSliced.value = []
  currentImageProcessed.value = 0
  blobArray.value = []
  allFinished.value = false
  imageUint8Array.value = null
  fileInput.value = null
  errorMessage.value = ''
}
const fileChanged = (e) => {
  try {
  // Reset
  isDone.value = false

  
  isSearching.value = true
  
  const files = e.target.files;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    imageUint8Array.value = new Uint8Array(e.target.result)
    const worker = new MyWorker()
 
    worker.postMessage(imageUint8Array.value.buffer);

    worker.onmessage = (event) => {
       if (event.data.type === 'found') {
        console.log('FOUND INDEX', event.data.fileindex)
        images.value.push(event.data.fileindex)
      } else if (event.data.type === 'complete') {
        console.log('JOB IS DONE')
        isSearching.value = false
        isDone.value = true
     if (images.value.length >=1) {
        processImages()
     } else {
       errorMessage.value = "No HEIC images found in the file."
         allFinished.value = true 
      }
    };
}

  }
  reader.readAsArrayBuffer(file)
}catch(e) {
  console.log('Error reading file ' ,e)
  errorMessage.value ="Error reading file, please try again"
    allFinished.value = true 
} 
}


const processImages = async () => {
  try {
    let slice
  for (let i = 0; i < images.value.length; i++) {
    const startIndex = images.value[i]
    const endIndex = images.value[i + 1]
    slice = imageUint8Array.value.slice(startIndex, endIndex);
    imageSliced.value.push(slice);
  }


  for (const slice of imageSliced.value) {
    const blob = new Blob([slice], { type: 'image/heic' }); // replace 'image/jpeg' with the actual type of your data
    const jpegBlob = await heic2any({ blob: blob, toType: 'image/jpeg', quality: 0.5 });
    const blobUrl = URL.createObjectURL(blob);
    const blobJpgUrl = URL.createObjectURL(jpegBlob);
    currentImageProcessed.value++
blobArray.value.push(blobUrl)
imageBlob.value.push(blobJpgUrl);
  
    };
    allFinished.value = true

  } catch (e) {
  console.log('Error converting to JPG ' ,e)
    allFinished.value = true 
  errorMessage.value ="Sorry, all were false positives, could not display any images."
  } 
  };


</script>


<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>


<style scoped>
main {
  display:flex;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  width: 100%;
  gap:2rem;
align-items: center;
}


.gallery {
  display:flex;
  justify-content: center;
  flex-direction: column;
  flex-wrap: wrap;
}
nav {
  display:flex;
  justify-content: space-between;
  padding: 10px;
  width: 100%;
  height: 45px;
  color:white;
  margin-bottom:2rem;
  background-color: rgb(48, 87, 215);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19);
}



.carvedHeader {
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.imageContainer {
  padding:1rem;
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  justify-content: center;
  /* border:1px solid red; */
}
.childImageContainer {
  display:flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
  margin: 10px;
  /* border:1px solid green; */
}
.imageContainer img {
  margin: 10px;
  width: 250px;
  aspect-ratio: 1/1;
  /* height: 300px; */
  object-fit: contain;
  border:1px solid black;
  background: transparent url(./assets/spinner.gif) no-repeat scroll center center;
}

</style>
