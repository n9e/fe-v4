define build-one
	rm -rf $(1)/src/packages &&\
	cp -r fe-packages $(1)/src/packages && cd $(1) && npm install && npm run build && cd ..
endef

clone-pkg:
	git clone https://github.com/n9e/fe-packages 

update-pkg:clean clone-pkg
	@echo "done update"

build:
	$(call build-one, layout-web)
	$(call build-one, mon-web)
	$(call build-one, ams-web) 
	$(call build-one, job-web) 
	$(call build-one, rdb-web)
	cp -r layout-web/static pub/
	
clean:
	rm -rf fe-packages

local-run:
	sudo docker run --name n9e-nginx --rm --net host --add-host "n9e.rdb n9e.ams n9e.job n9e.index n9e.monapi n9e.transfer:127.0.0.1" \
	-v $(shell pwd)/pub:/home/ecmc/pub -v $(shell pwd)/nginx.conf:/etc/nginx/conf.d/default.conf -dit nginx:1.17
local-stop:
	sudo docker stop n9e-nginx