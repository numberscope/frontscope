<template>
  <div class="container">
        <p>{{ msg }}</p>
        <ul>
                <li v-for="number in data" :key="number">
                        {{ number }}
                </li>
        </ul>
  </div>

</template>


<script>

import axios from 'axios';


export default {
  name: 'VueTest',
  data() {
    return {
      msg: '',
      data: [],
    };
  },
  methods: {
    getMessage() {

      const path = `http://128.138.150.182/get_sequence/A0001`;
      /* const path = `http://localhost:5000/get_sequence/A0001`; */

      axios.get(path)
        .then((res) => {

          this.msg = res.data["name"];
          this.data = res.data["values"];

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
