
const form = document.querySelector('#img-form')
const img = document.querySelector('#img')
const outputPath = document.querySelector('#output-path')
const filename = document.querySelector('#filename')
const heightInput = document.querySelector('#height')
const widthInput = document.querySelector('#width')



// Load image
const loadImage = (e) => {
  const file = e.target.files[0]

  if(!isFileImage(file)){
    toastAlert('Please select an image', {isSuccess: false})
    return
  }

  //Get original image dimensions
  const image =  new Image()
  image.src = URL.createObjectURL(file)
  image.onload = function(){
    widthInput.value = this.width
    heightInput.value = this.height
  }

  form.style.display = 'block'
  filename.innerText = file.name
  outputPath.innerText = path.join(os.homedir(), 'imageresizer')
}


// Send image data to main
const sendImage = (e) =>{
  e.preventDefault()

 const width =  widthInput.value
 const height = heightInput.value
 const imagePath =  img.files[0].path

  //Check if file is an image
  if(!img.files[0]){
    toastAlert('Please upload image', {isSuccess: false})
    return
  }

  if(width === '' || height === ''){
    toastAlert('Please fill in a height and width', {isSuccess: false})
    return
  }

  // Send to main using ipcRender
  ipcRenderer.send('image:resize', {
    imagePath, 
    width, 
    height,
  })
}

// Catch image done event 
ipcRenderer.on('image:done', () => {
  toastAlert(`Image resized to ${widthInput.value} x ${heightInput.value}`, {isSuccess: true})
})

//Make sure fine is image
const isFileImage = (file) => {
  const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/gif']
  return file && acceptedImageTypes.includes(file['type'])
}


const toastAlert = (message, {isSuccess = false}) => {
  Toastify.toast(
   {
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: !isSuccess?  'red': 'green',
      color: 'white',
      textAlign: 'center'
    }
   }

  )
}


img.addEventListener('change', loadImage)
form.addEventListener('submit', sendImage)