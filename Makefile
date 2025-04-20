TARGET_FILE := .done
CODE_WORKSPACE := figwallet.code-workspace

ifeq ($(wildcard $(TARGET_FILE)),)
all: interface/apps interface/apps/figwallet
		$(info "Done! You can now open workspace from figwallet.code-workspace.")
else
all:
		$(info "Already done setup!")
endif

interface/apps:
	git submodule update --init --recursive

interface/apps/figwallet:
	git clone https://github.com/HuangFJ/figwallet interface/apps/figwallet
	$(file > $(CODE_WORKSPACE),{"folders": [{"path": "interface/apps/figwallet"}]})
  touch $(TARGET_FILE)
