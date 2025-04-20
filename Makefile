MAKEDONE := .makedone
CODE_WORKSPACE := figwallet.code-workspace

ifeq ($(wildcard $(MAKEDONE)),)
all: interface/apps interface/apps/figwallet
	@echo "{\"folders\": [{\"path\": \"interface/apps/figwallet\"}]}" > $(CODE_WORKSPACE)
	touch $(MAKEDONE)
	touch interface/apps/figwallet/$(MAKEDONE)
	$(info "Done! You can now open workspace from $(CODE_WORKSPACE).")
else
all:
	$(info "Already done setup!")
endif

interface/apps:
	git submodule update --init --recursive

interface/apps/figwallet:
	git clone https://github.com/HuangFJ/figwallet interface/apps/figwallet
