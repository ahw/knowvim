all: setup
	cp -rf js/application/* js/build/
	find js/build -name "*.coffee" | xargs rm -f
	coffee --compile --output js/build/ js/application/

	cp -rf js/tst/* js/build-tst/
	find js/build-tst -name "*.coffee" | xargs rm -f
	coffee --compile --output js/build-tst/ js/tst/

clean:
	rm -rf js/build/*
	rm -rf js/build-tst/*

compile: setup
	coffee --compile --output js/build/ js/application/
	coffee --compile --output js/build-tst/ js/tst/

watch: setup
	coffee --compile --watch --output js/build/ js/application/

watch-test: setup
	coffee --compile --watch --output js/build-tst/ js/tst/


setup:
	mkdir -p js/build
	mkdir -p js/build-tst

help:
	@echo "Possible targets include:"
	@echo ""
	@echo "    all (default) : Build all application and test JavaScript"
	@echo "    clean         : Clean (remove) both js/build/* and js/build-tst/*"
	@echo "    compile       : One-time compile both application and test CoffeeScript"
	@echo "    watch         : Compile and watch application CoffeeScript"
	@echo "    watch-test    : Compile and watch test CoffeeScript"
	@echo "    help          : Print this help text"
	@echo ""
