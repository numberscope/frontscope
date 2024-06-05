import {reactive} from 'vue'
import {ModalType} from '@/shared/modalType'

/**
 * Stores variables that represent whether the modal
 * for changing sequences or visualizers should be shown
 */
export const showChangeModal = reactive({
    show: false,
    modalType: ModalType.Sequence,
    open(modalType: ModalType) {
        this.modalType = modalType
        this.show = true
    },
    close() {
        this.show = false
    },
})
