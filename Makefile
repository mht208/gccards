NAME=gccards
JS_DIR=js
JS_FILES=json2.js jstorage.js \
	loader.js locale.js gc.js version.js \
	1s.js 1s_jp.js 2s.js 2s_jp.js 3s.js 3s_jp.js \
	4s.js 4s_jp.js 5s.js 5s_jp.js \
	quests.js new.js new_jp.js evaluation.js simulator.js \
	view_battle.js view_cards.js view_check.js view_comparison.js \
	view_excards.js view_favorites.js view_index.js \
	view_m_cards.js view_options.js
JS_SRC:=$(addprefix $(JS_DIR)/,$(JS_FILES))
JS_BIN:=$(JS_SRC:%.js=%.min.js)
HTML=attributes.html battle.html battle2.html cards.html check.html \
	comparison.html excards.html export.html faq.html favorites.html \
	index.html lib.html options.html quests.html skills.html \
	m_cards.html
CSS_DIR=css
CSS_SRC=battle.css favorites.css gc.css gc_jp.css options.css
CSS_BIN:=$(addprefix $(CSS_DIR)/,$(foreach file,$(CSS_SRC),$(subst .css,.min.css,$(file))))
IMAGE=attributes delim.jpg delim.png down.gif external-link.png \
	faq_direct_link.jpg question.jpg question.png rare_star.jpg \
	rare_star.png quest_star.png silhouettes up.gif \
	save_24x24.jpg save_all_24x24.jpg revert_24x24.jpg \
	revert_all_24x24.jpg comparison_24x24.jpg \
	collapse.png expand.png
RELEASE=release
ARGS=--compilation_level SIMPLE_OPTIMIZATIONS
OUTPUT_NAME=$(NAME)-$(shell date +%Y-%m-%d)
OUTPUT_DIR=$(RELEASE)/$(OUTPUT_NAME)
VERSION_FILE=js/version.js
RANDOM=$(shell date +%s)

all: $(JS_BIN) $(CSS_BIN)

js/%.min.js: js/%.js
	closure-compiler $(ARGS) $< > $@

css/%.min.css: css/%.css
	yuicompressor --type css $< -o $@

r: $(JS_BIN) $(CSS_BIN)
	mkdir -p $(OUTPUT_DIR)
	mkdir -p $(OUTPUT_DIR)/$(JS_DIR)
	mkdir -p $(OUTPUT_DIR)/images
	cp $(HTML) $(OUTPUT_DIR)
	cp $(JS_BIN) $(OUTPUT_DIR)/$(JS_DIR)
	cp -R $(CSS_DIR) $(OUTPUT_DIR)
	cp -R $(addprefix images/,$(IMAGE)) $(OUTPUT_DIR)/images
	sed -i bak 's/sitebase=localsite/sitebase=remotesite/' $(OUTPUT_DIR)/js/gc.min.js
	rm $(OUTPUT_DIR)/js/gc.min.jsbak
	cd $(RELEASE); zip -r -q $(OUTPUT_NAME).zip $(OUTPUT_NAME)

$(VERSION_FILE): $(filter-out $(VERSION_FILE),$(JS_SRC))
	echo "var VERSION = \"$(RANDOM)\";" > $(VERSION_FILE)

clean:
	rm $(JS_BIN) $(CSS_BIN)

.PHONY: all clean r
