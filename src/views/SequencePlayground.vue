<template>
  <div class="jumbotron">

    <div class="jumbotron">

    <h1>Get a Sequence</h1>

    <div class="container">
      <form style="padding-bottom: 10px;">
          <div class="form-row">
            <div class="col">
              <label for="seq_type">Sequence Type</label>
              <select class="form-control" id="seq_type" v-model="sequenceType">

                <option v-for="seq in options" v-bind:value="seq.value" :key="seq">
                  {{ seq.text }}
                </option>

              </select>
            </div>

            <div class="col">
              <label for="modulus">Modulus</label>
              <input type="number" class="form-control" id="modulus" v-model="modulus" min="0">
            </div>

            <div class="col">
              <label for="numElements">Number of Elements</label>
              <input type="number" class="form-control" id="numElements" v-model="numElements" min="10" max="100">
            </div>
          </div>
          <div class="form-group" style="padding:20px;">
            <input type="checkbox" id="checkbox" v-model="includeModulus">
            <label for="checkbox">Include a Modulus</label>
          </div>
      </form>
      
      <button type="submit" class="btn btn-primary" v-on:click="getMessage(sequenceType, modulus, numElements)">Get Sequence</button>

      <div class="container" style="padding: 30px;">
        <h3>Sequence: {{ sequenceType }}</h3>
        <h3>Number of Elements: {{ numElements }}</h3>
        <h3>Modulus: {{ modulus }}</h3>
      </div>
    </div>
    </div>

    <div class="container" style="padding-top: 20px;">
      <ul id="seq_list">
        <li v-for="number in sequence" :key="number">
                {{ number }}
        </li>
      </ul>
    </div>
  </div>

</template>


<script>

import axios from 'axios';


export default {
  name: 'SequencePlayground',
  data() {
    return {
            numElements: 100,
            modulus: 100,
            sequenceType: "A000027",
            options : [
                      {text : "Natural Numbers", value: "A000027"},
                      {text : "Prime Numbers", value: "A000040"},
                      {text : "Triangle Numbers", value: "A000217"}
            ],
            sequence: [],
            includeModulus: false,
    }
  },


  methods: {
    getMessage(seqId, modulus, num) {

        /* const path_prefix = `http://128.138.150.182/api/get_sequence`; */

      num = Math.max(Math.min(num, 100), 1);
      
      if(modulus < 0) {
        modulus = 0;
      }

      if(!this.includeModulus){
        modulus = 0;
      }

      const path = `http://128.138.150.182/api/get_sequence/${seqId}/${num}/${modulus}`;

      axios.get(path)
        .then((res) => {

          this.msg = res.data["name"];
          this.sequence = res.data["values"];

        })

        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
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

#seq_list li
{
display: inline;
list-style-type: none;
padding-right: 20px;
}
</style>
