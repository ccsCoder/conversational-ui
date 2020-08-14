//init method
class ImageCarousel {
  constructor() {
    this.current = 0;
    this.images = null;
    this.toastContainer = null;
  }

  init = () => {
    this.images = document.querySelector('.img-container').querySelectorAll('img');
    this.toastContainer = document.querySelector('.toast-message');
  }

  next = (isPrev = false) => {
    // hide the current image
    this.images[this.current].classList.remove('show');
    this.images[this.current].classList.add('hide');

    if (isPrev) {
      this.current--;
      if (this.current < 0) this.current = this.images.length - 1;
    } else {
      this.current++;
      // roll back index
      if (this.current >= this.images.length) this.current = 0;
    }

    // show the next image
    this.images[this.current].classList.remove('hide');
    this.images[this.current].classList.add('show');
  }

  autoPlay = () => {
    // setInterval(this.next, 5000);
  }

  toast = message => {
    this.toastContainer.querySelector('span').innerText = message;
    this.toastContainer.classList.add('show-toast');
    // hide after 2 s.
    setTimeout(() => {
      this.toastContainer.classList.remove('show-toast');
      // this.toastContainer.classList.add('hide-toast');
    }, 10000);
  }

}

class SpeechSynth {
  constructor() {
    this.speech = new SpeechSynthesisUtterance('');
    this.speech.lang = 'en-IN';

    speechSynthesis.onvoiceschanged = this.assignINVoice;
  }
  
  speak = message => {
    this.assignINVoice();
    this.speech.text = message;
    this.speech.rate = .8;
    speechSynthesis.speak(this.speech);
  }

  assignINVoice = () => {
    const veenaVoice = speechSynthesis.getVoices().find(voice => voice.name == 'Veena');
    if (veenaVoice) {
      this.speech.voice = veenaVoice;
    }
  }
}

const COMMANDS = {
  NEXT: 'next',
  STOP: 'stop',
  PREV: 'previous',
}

class SpeechRecognizer {
  constructor() {
    // normalize speech recognition...
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

    this.recognizer = new window.SpeechRecognition();
    this.recognizer.continuous = true;
    this.recognizer.onresult = this.onRecognition;
  }
  
  onRecognition = e => {
    const latestRecognition = e.results[e.results.length - 1][0];
    if (latestRecognition.transcript.trim() === COMMANDS.NEXT) {
      imageCarousel.next();
    } else if (latestRecognition.transcript.trim() === COMMANDS.PREV) {
      imageCarousel.next(true);
    } else if (latestRecognition.transcript.trim() === COMMANDS.STOP) {
      speechSynth.speak('Stopping. To navigate again, click the Microphone icon');
      this.stop();
      isListening = false;
      document.querySelector('.icon-tabler-microphone').classList.remove('mic-listening');
    } 
    else {
      speechSynth.speak('Sorry, I did not recognize that !');
      imageCarousel.toast('Sorry, did not recognize the last command.')
    }
  }
  
  start = () => {
    setTimeout(() => speechSynth.speak('I am ready.'), 200);
    this.recognizer.start();
  }

  stop = () => {
    this.recognizer.stop();
  }
  
}

// Instances
const imageCarousel = new ImageCarousel();
const speechSynth = new SpeechSynth();
const speechRecognizer = new SpeechRecognizer();
let isListening = false;


const initMicrophone = () => {
  // mic icon
  const mic = document.querySelector('.icon-tabler-microphone');
  mic.addEventListener('click', () => {
    isListening = !isListening;
    if (isListening) {
      speechRecognizer.start();
    } else {
      // nothing...
      speechRecognizer.stop();
    }
    mic.classList.toggle('mic-listening');
  });
  
}

window.addEventListener('DOMContentLoaded', () => {
  imageCarousel.init();
  imageCarousel.autoPlay();
  setTimeout(() => imageCarousel.toast('Press the Mic and say "Next" or "Previous" to navigate, "Stop" to end.'), 2000);
  // initialize the microphone
  initMicrophone();
});