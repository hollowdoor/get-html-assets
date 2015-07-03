export default class Thing {
    speak(){
        var str = '<p>I am a thing object.</p>';
        document.querySelector('body').innerHTML += str;
    }
}
