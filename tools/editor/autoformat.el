;; Automatically run tools/prettiest.js on the current file when saving in emacs
;;
;; You can copy this file into your emacs configuration file (~/.emacs or
;; ~/.config/emacs or such), or copy the two functions into another file,
;; and load that file and just put the two `add-hook` calls into your
;; configuration file.
;; Note that you must fill in the full path to the prettiest.js file on
;; your system.

;; Inspired by https://emacs.stackexchange.com/questions/54351/how-to-run-a-custom-formatting-tool-on-save

(defun prettiest-buffer ()
  (interactive)
  (let ((this-buffer (current-buffer))
        (temp-buffer (generate-new-buffer " *prettiest*"))
        ;; Use for format output or stderr in the case of failure.
        (temp-file (make-temp-file "prettiest" nil ".err"))
        ;; Always use 'utf-8-unix' & ignore the buffer coding system.
        (default-process-coding-system '(utf-8-unix . utf-8-unix)))
    (condition-case err
        (unwind-protect
            (let ((status
                   (call-process-region nil nil "node" nil
                      ;; stdout is a temp buffer, stderr is file.
                      (list temp-buffer temp-file) nil
                      ;; arguments.
                      "[/FULL/PATH/TO/]tools/prettiest.js"
                      "--write" "--named"
                      (buffer-file-name) "-"))
                  (stderr
                   (with-temp-buffer
                     (insert-file-contents temp-file)
                     (buffer-substring-no-properties
                      (point-min) (point-max)))))
              (cond
               ((stringp status)
                (error "(prettier-eslint killed by signal %s: %s)"
                       status stderr))
               ((> status 1)
                (error "(prettier-eslint failed with code %d: %s)"
                       status stderr))
               (t
                ;; Include the stderr as a message,
                ;; useful to check on how the program runs.
                (unless (string-equal stderr "")
                  (with-output-to-temp-buffer "*prettiest-error*"
                    (princ stderr)))
                    (message "%s" stderr)))
              ;; Replace this-buffer's contents with stdout.
              (unless (= (buffer-size buffer) 0)
                (replace-buffer-contents temp-buffer))))
      ;; Show error as message, so we can clean up below.
      (message "%s" (error-message-string err)))

    ;; Cleanup.
    (delete-file temp-file)
    (when (buffer-name temp-buffer)
      (kill-buffer temp-buffer))
    ))


(defun prettiest-save-hook-for-this-buffer ()
  (add-hook 'before-save-hook
            (lambda ()
              (progn
                (prettiest-buffer)
                ;; Continue to save.
                nil))
            nil
            ;; Buffer local hook.
            t))

(add-hook 'typescript-mode-hook
          (lambda () (prettiest-save-hook-for-this-buffer)))
(add-hook 'vue-mode-hook
          (lambda () (prettiest-save-hook-for-this-buffer)))
