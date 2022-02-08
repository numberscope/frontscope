;; Automatically run prettier-eslint on the current file when saving in emacs
;;
;; You can copy this file into your emacs configuration file (~/.emacs or
;; ~/.config/emacs or such), or copy the two functions into another file,
;; and load that file and just put the two `add-hook` calls into your
;; configuration file.

;; Inspired by https://emacs.stackexchange.com/questions/54351/how-to-run-a-custom-formatting-tool-on-save

(defun prettier-eslint-buffer ()
  (interactive)
  (let ((this-buffer (current-buffer))
        (temp-buffer (generate-new-buffer " *prettier-eslint*"))
        ;; Use for format output or stderr in the case of failure.
        (temp-file (make-temp-file "prettier-eslint" nil ".err"))
        ;; Always use 'utf-8-unix' & ignore the buffer coding system.
        (default-process-coding-system '(utf-8-unix . utf-8-unix)))
    (condition-case err
        (unwind-protect
            (let ((status
                   (call-process-region nil nil "npx" nil
                      ;; stdout is a temp buffer, stderr is file.
                      (list temp-buffer temp-file) nil
                      ;; arguments.
                      "prettier-eslint" "--stdin" "--stdin-filepath"
                      (buffer-file-name)))
                  (stderr
                   (with-temp-buffer
                     (unless (zerop (cadr (insert-file-contents temp-file)))
                       (insert ": "))
                     (buffer-substring-no-properties (point-min) (point-max))
                     )))
              (cond
               ((stringp status)
                (error "(prettier-eslint killed by signal %s%s)"
                       status stderr))
               ((not (zerop status))
                (error "(prettier-eslint failed with code %d%s)"
                       status stderr))
               (t
                ;; Include the stderr as a message,
                ;; useful to check on how the program runs.
                (unless (string-equal stderr "")
                    (message "%s" stdout))))
              ;; Replace this-buffer's contents with stdout.
              (replace-buffer-contents temp-buffer)))
      ;; Show error as message, so we can clean-up below.
      (error (message "%s" (error-message-string err))))

    ;; Cleanup.
    (delete-file temp-file)
    (when (buffer-name temp-buffer)
      (kill-buffer temp-buffer))))


(defun prettier-eslint-save-hook-for-this-buffer ()
  (add-hook 'before-save-hook
            (lambda () (progn
                         (prettier-eslint-buffer)
                         ;; Continue to save.
                         nil))
            nil
            ;; Buffer local hook.
            t))

(add-hook 'typescript-mode-hook
          (lambda () (prettier-eslint-save-hook-for-this-buffer)))
(add-hook 'vue-mode-hook
          (lambda () (prettier-eslint-save-hook-for-this-buffer)))
