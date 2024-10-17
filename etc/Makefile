.RECIPEPREFIX = |
.PHONY: FORCE playreport phony typecheck vueserve docserve preview prettiest

SHELL = /bin/bash

sources != shopt -s globstar && echo src/** index.html
docs != shopt -s globstar &&\
        echo doc/** etc/doc_theme/** README.md CONTRIBUTING.md etc/mkdocs.yml
tests != shopt -s globstar && echo e2e/tests/**
manifest := package.json package-lock.json requirements.txt tools/pyrun.mjs $(wildcard .husky/p*)
typescript_config := $(wildcard tsconfig*json)
e2e_local_config := e2e/playwright.config.ts
e2e_docker_config := $(e2e_local_config) e2e/playdocker.config.ts e2e/Dockerfile

# Dummy files
installed := etc/npm_install_ran_at
typechecked := etc/typechecked_at
docked := e2e/docker_image_built

E2E_IMAGE := frontscope-e2e-image
E2E_CONTAINER := frontscope-e2e-container

# Default target: build the distribution in the dist/ directory
dist: $(sources) $(docs) $(install) $(typechecked) etc/vite.config.ts etc/Makefile
|   npx vite --config etc/vite.config.ts build
|   node tools/pyrun.mjs mkdocs build --strict --config-file etc/mkdocs.yml
|   touch $@

# Make sometimes thinks it needs to make the following target because of some
# weirdness of how `sh -c 'COMMAND' NAME` works, or at least so I guess:
phony:
|   @echo

$(installed): $(manifest)
|   npm install
|   touch $@

$(typechecked): $(installed) $(typescript_config) $(sources)
|   npx vue-tsc --noEmit -p tsconfig.vitest.json --composite false
|   @touch $@

prettiest: $(installed)
|   @node tools/prettiest.js $(flags) .

typecheck: $(typechecked)
|   @echo TypeScript types check.

vueserve: $(typechecked)
|   npx vite --config etc/vite.config.ts $(if $(mode),--mode=$(mode))

docserve: $(installed)
|   node tools/pyrun.mjs mkdocs serve --strict -f $(or $(config),etc/mkdocs.yml)

preview: $(dist)
|   npm run preview:cmd

testunit: $(typechecked)
|   npx vitest --config etc/vitest.config.ts run $(cl_args)

# Makes a Dockerfile that can be reused for multiple test runs
$(docked): $(manifest) $(e2e_docker_config)
|   docker build -t $(E2E_IMAGE) -f e2e/Dockerfile .
|   touch $@

last_cl_args != touch -a e2e/.last_cl_args && cat e2e/.last_cl_args

# If no arguments are given to playreport, assume just want the last
# playwright test that has been run
ifeq ($(MAKECMDGOALS),playreport)
ifeq ($(cl_args),)
override cl_args := $(last_cl_args)
endif
endif
cl_arg_dep =
ifeq ($(last_cl_args),$(cl_args))
else
e2e/.last_cl_args: FORCE
|   @echo Detected new testing command-line arguments:
|   @echo "    '"$(cl_args)\' vs \'$(last_cl_args)\'
|   echo $(cl_args) > $@

cl_arg_dep = e2e/.last_cl_args
endif

# OK, to certify that all end-to-end tests are in good shape, we have
# to run the non-WebGL non-firefox tests in docker, the firefox WebGL tests
# locally, merge the two reports, and then check if everything passed (whew!)
e2e/certificate: e2e/results/combined/playwright-report e2e/results/docker e2e/results/local
|   @grep 'status.*passed' e2e/results/docker/output/.last-run.json
|   @grep 'status.*passed' e2e/results/local/output/.last-run.json
|   echo 'All tests passed' > $@

e2e/results/combined/playwright-report: e2e/results/docker e2e/results/local  e2e/playmerge.config.ts
|   mkdir -p e2e/results/combined
|   cp e2e/results/docker/report.zip e2e/results/combined/report-docker.zip
|   cp e2e/results/local/report.zip e2e/results/combined/report-local.zip
|   npx playwright merge-reports --config=e2e/playmerge.config.ts e2e/results/combined
|   touch $@

# Here we run webgl tests in firefox on the local machine
# Since there are not many of them, we could easily miss all of them
# with a command-line argument, so pass even if we don't find any
# matching tests.
e2e/results/local: dist $(e2e_local_config) $(tests) $(cl_arg_dep)
|   PLAYWRIGHT_BLOB_OUTPUT_FILE=$@/report.zip npm run test:e2e:cmd -- --grep @webGL --project firefox --pass-with-no-tests --output $@/output --reporter blob $(cl_args) || echo [Firefox webGL tests failed]
|   touch $@

# And here we run all the other tests under Docker
# Here it is likely an error if there are no tests
e2e/results/docker: $(docked) dist $(e2e_docker_config) $(tests) $(sources) $(cl_arg_dep)
# Start the container with a dummy command to keep it alive
|   docker run --name $(E2E_CONTAINER) --rm -d -i -t $(E2E_IMAGE) /bin/sh
# Copy the current source, build, and tests to the container
|   docker cp dist $(E2E_CONTAINER):/test
|   docker cp src $(E2E_CONTAINER):/test
|   docker cp e2e/tests $(E2E_CONTAINER):/test/e2e
# Run the tests! Since we have to use a different config, sadly no way
# to reuse the npm command, so we just roll our own:
|   docker exec $(E2E_CONTAINER) npx playwright test -c e2e/playdocker.config.ts $(cl_args) || echo '[Docker tests failed]'
# Recreate the results directory
|   rm -rf $@
# Extract the results from the container
|   mkdir -p e2e/results
|   docker cp $(E2E_CONTAINER):/test/$@ $@
ifeq (,$(findstring --update-snapshots,$(cl_args)))
else
|   docker cp $(E2E_CONTAINER):/test/e2e/tests $@
|   cp -r $@/tests/*-snapshots e2e/tests
endif
# Clean up
|   docker stop $(E2E_CONTAINER)
|   touch $@

# finally, report on the full combined tests:

playreport: e2e/results/combined/playwright-report
| playwright show-report $^

