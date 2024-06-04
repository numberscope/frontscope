import {reactive} from 'vue'

/**
 * Stores a boolean which represents whether the modal
 * for changing sequences should be shown
 */
export const showChangeModal = reactive({
    show: false,
    open() {
        this.show = true
    },
    close() {
        this.show = false
    },
})
