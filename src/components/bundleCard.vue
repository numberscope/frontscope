<template>
<div class="col-4-sm">
    <div class="card" style="width: 18rem;">
      <!--<img class="card-img-top" src=".../100px180/" alt="Card image cap">-->
      <div class="card-body">
        <h5 class="card-title">{{seq.name + ' + ' + viz.name}}</h5>
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
</div>
</template>

<script>
export default {
    name: 'BundleCard',
    methods : {},
    props: {
        seq: Object,
        viz: Object
        }
    }
</script>

<style scoped>
    .card{
        margin: 1em;
        min-height: 250px;
    }
</style>
