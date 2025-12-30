UI_DIR := ui
UI_BUILD := $(UI_DIR)/dist
BACKEND_DIR := backend
BACKEND_STATIC := $(BACKEND_DIR)/src/main/resources/static

.PHONY: ui-run ui-clean ui-deploy backend-build docker-build up clean

ui-run:
	cd $(UI_DIR) && npm run dev

ui-clean:
	rm -rf $(UI_BUILD)
	rm -rf $(BACKEND_STATIC)

clean: ui-clean

ui-deploy: clean
	cd $(UI_DIR) && npm ci && npm run build
	mkdir -p $(BACKEND_STATIC)
	cp -r $(UI_BUILD)/* $(BACKEND_STATIC)

backend-build:
	cd $(BACKEND_DIR) && ./gradlew bootJar

backend-clean:
	rm -rf $(BACKEND_DIR)/build

docker-build:
	docker compose build

up: ui-deploy docker-build
	docker compose up -d

quick-up: docker-build
	docker compose up -d
