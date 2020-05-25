<template>
    <modal name="seq-params-modal">
        <p>{{params}}</p>
    </modal>
</template>

<script>
export default {
    name: 'SequenceParamsModal',
    props: {
        params: Array
    }
}
</script>
