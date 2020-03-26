<template>
  <div class="container">
        <p>{{ msg }}</p>
  </div>
</template>


<script>

import axios from 'axios';

export default {
  name: 'VueTest',
  data() {
    return {
      msg: '',
    };
  },
  methods: {
    getMessage() {
      const path = 'http://localhost:5000/vuetest';
      axios.get(path)
        .then((res) => {
          this.msg = JSON.stringify(res.data);
          console.log(this.msg);
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
  },
  created() {
    this.getMessage();
  },
};
</script>



<style>
/* Text inside image TODO change this 
   to background image, I wasnt having luck*/
.centered {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* hover over to make background orange */
.orange:hover {
        background-color: orange;
}

/* Hover to make text orange */
.textorange:hover{
        color: orange;
}
</style>
