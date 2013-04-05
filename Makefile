all:
	cp -rf js/application/* js/build/
	find js/build -name "*.coffee" | xargs rm -f
	coffee --compile --output js/build/ js/application/

	cp -rf js/tst/* js/build-tst/
	find js/build-tst -name "*.coffee" | xargs rm -f
	coffee --compile --output js/build-tst/ js/tst/

clean:
	rm -rf js/build/*
	rm -rf js/build-tst/*

compile:
	coffee --compile --output js/build/ js/application/
	coffee --compile --output js/build-tst/ js/application-tst/

watch:
	coffee --compile --watch --output js/build/ js/application/

watch-test:
	coffee --compile --watch --output js/build-tst/ js/tst/
