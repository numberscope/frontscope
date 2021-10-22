<template>
    <div>
        <div class="container" style="max-width:2500px;" id="home">
            <img class="mx-auto" src="@/assets/imgs/homepage/background200px.jpg" width="100%">
            <div class="centered carousel-caption">
                <h1>
                    <span style="color:#f75c03;">
                        <b>USER MANUALS</b>
                    </span>
                    <br>
                </h1>
            </div>
        </div>
        <div class="row" style="paddingTop: 50px; backgroundColor: #809fff;">

            <!--left box-->
            <div class="col-md-4 side">
                <div class="container">
                    <h2><b>Scopes</b></h2>
                </div>

                <div>
                    <button v-on:click="swapManual('differences')">Differences</button>
                </div>

                <div>
                    <button v-on:click="swapManual('modFill')">Mod Fill</button>
                </div>

                <div>
                    <button v-on:click="swapManual('shiftCompare')">Shift Compare</button>
                </div>

                <div>
                    <button v-on:click="swapManual('turtle')">Turtle</button>
                </div>
            </div>

            <!--right box-->
            <div class="col-md-8 page">
                <h2>{{ tool }}</h2>
                <br>

                <h5>Parameters</h5>
                <ul>
                    <li v-for="p in params" v-bind:key="p.text">
                        {{p.text}}
                    </li>
                </ul>
                <br>
                <p>
                    {{ desc }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'

export default Vue.extend({
    name: 'UserManual',
    data() {
      return {
        tool: 'Tool',
        params: ([] as {text: string}[]), // get the type correct
        desc: 'Select a tool on the left to learn about it.'
      }
    },
    methods: {
      swapManual: function(manual: string) {
        switch(manual) {
          case 'differences':
            this.tool = "Differences";
            this.desc = "";
            this.params = [
              { text: "n: number. Number of elements used." },
              { text: "Levels: number."},
            ];
            break;
          case 'modFill':
            this.tool = "Mod Fill";
            this.desc = "";
            this.params = [
              { text: "Mod Dimensions: number." },
            ];
            break;
          case 'shiftCompare':
            this.tool = "Shift Compare";
            this.desc = "Draws an image of x and y dimensions. Using each pixel's coordinates as n-th elements of the sequence, compares two elements (with mod applied), and colors the corresponding pixel white if equivalent, and black otherwise.";
            this.params = [
              { text: "No external parameters. Press 'up' and 'down' arrow keys to increase and decrease mod respectively." },
            ];
            break;
          case 'turtle':
            this.tool = "Turtle";
            this.desc = "Draws a continuous line, changing angle every step by the angle corresponding to each sequential element's value.";
            this.params = [
              { text: "Domain: comma-separated list of numbers. All possible values in the sequence (works best with mod)" },
              { text: "Range: comma-separated list of numbers. Angles corresponding to the domain elements. Must be the same length as the domain." },
              { text: "Step Size: number. Length of line drawn for each input element." },
              { text: "Stroke Weight: number. Width of line." },
              { text: "Starting X/Y: number. Starting location on the canvas." },
            ];
            break;
          default:
            this.tool = "Tool";
            this.desc = "Select a tool on the left to learn about it."
            this.params = [];
            break;
        }
      }
    }
})
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

/* sidebar */
.side {
  background-color: #f75c03;
}

/* user manual selector buttons */
.side button {
  padding: 5px;
  width: 250px;
  border: none;
  margin: 5px;
}

.side button:hover {
  background-color: #809fff;
}

/* main manual style */
.page {
  padding-top: 50px;
  padding-left: 50px;
  text-align: left;
  height: 600px;
  background-color: white;
  border: 2px solid #809fff;
}

/* Hover to make text orange */
.textorange:hover{
        color: orange;
}
</style>
