const mydiv = document.createElement('header')
mydiv.innerHTML = '<div>Here <em>I</em> am</div>'
mydiv.classList.add('section')
console.log('And I ran', mydiv)
document.body.prepend(mydiv)
