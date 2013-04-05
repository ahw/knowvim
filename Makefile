all:
	cp -rf js/application/* js/build/
	find js/build -name "*.coffee" | xargs rm -f
	coffee --compile --output js/build/ js/application/
	tree js/build

clean:
	rm -rf js/build/*

compile:
	coffee --compile --output js/build/ js/application/

watch:
	coffee --compile --watch --output js/build/ js/application/
