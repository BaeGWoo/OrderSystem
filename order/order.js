let products;
let baguni = [];
let Presetbaguni = [];
let curTotal = 0;
let SelectedButton;
let PresetMode = true;
const categoryDropdown = document.getElementById("category");
const initialDropdownHTML = document.getElementById('presetDropdown').innerHTML;
//test
//#region 기본구성

document.addEventListener('DOMContentLoaded', function () {
    const request = indexedDB.open('CurOrder', 1);


    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        // curOrderDetail 테이블 생성
        const curOrderDetailStore = db.createObjectStore('curOrderDetail', { keyPath: 'name' });
        // preset 테이블 생성
        const presetStore = db.createObjectStore('preset', { keyPath: 'presetName' });

    };

    const buttons1 = document.querySelectorAll('.buttonContainer1 button');
    const buttons2 = document.querySelectorAll('.buttonContainer2 button');
    var parentElement = document.getElementById("presetDropdown");
    for (var i = 1; i <= 10; i++) {
        var option = document.createElement("option");
        option.value = "btn" + i;
        option.id = "btn" + i;
        option.text = i;
        parentElement.appendChild(option);
      }
    ButtonDataReset(buttons1);
    ButtonDataReset(buttons2);

    //updateBaguni();
    clearOrderDetails();
    // 제품 데이터를 로드합니다.
    fetch('../config/Product.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            //updateCategoryList();
            setCategoryList();
        })
        .catch(error => console.error('제품 데이터 로딩 중 오류 발생:', error));
});

//즐겨찾기 목록에 대하여 기본정보 초기화
function ButtonDataReset(buttons) {
    const request = indexedDB.open('CurOrder', 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['preset'], 'readwrite');
        const presetStore = transaction.objectStore('preset');

        buttons.forEach(button => {
            // 클릭된 버튼의 ID를 키로 사용
            const presetKey = button.id;
            let presetName = presetKey;
            button.textContent = "등록가능";

            const getRequest = presetStore.get(presetName);

            getRequest.onsuccess = function (e) {
                const existingData = e.target.result;
                if (!existingData) {
                    const presetData = {
                        presetName: presetName,
                        presetTitle: "등록가능",
                        presetMenu: []
                    };

                    const addRequest = presetStore.add(presetData);
                    addRequest.onsuccess = function () {
                        console.log('프리셋 데이터 추가 성공!');
                    };
                }

                else {
                    // if (existingData.presetTitle==="등록가능")
                    button.textContent = existingData.presetTitle.replace('btn', '');
                    // else
                    //     button.textContent = existingData.presetTitle;
                    updateDropdownOptions();
                }
            }

        });
    }

}
//드롭다운 이름 초기화
function updateDropdownOptions() {
    console.log("update");
    const request = indexedDB.open('CurOrder', 1);
    const dropdown = document.getElementById("presetDropdown");

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['preset'], 'readonly');
        const presetStore = transaction.objectStore('preset');

        // 모든 드롭다운 옵션에 대해서
        for (let i = 0; i < dropdown.options.length; i++) {
            const option = dropdown.options[i];

            // 옵션의 id와 동일한 key값을 가진 preset 데이터를 가져오기
            const presetKey = option.id; // 예: 1, 2, 3...
            const getRequest = presetStore.get(presetKey);

            getRequest.onsuccess = function (event) {
                const presetData = event.target.result;

                // 가져온 데이터가 있으면 해당 presetTitle을 옵션의 text로 설정
                if (presetData) {
                    if (presetData.presetTitle === "등록가능")
                        option.style.display = 'none';
                    //option.textContent = presetData.presetTitle.replace('btn', '');
                    else {
                        option.style.display = 'block';
                        option.textContent = presetData.presetTitle;
                    }
                }
            };
        }
    };
}

//제품목록 초기화
function setCategoryList() {
    setDropdownPlaceHolder();

    let productArr = [];
    products.forEach(product => {
        productArr.push(
            {
                name: product.name,
                unit: product.unit,
                price: product.price,
                category: product.category,
                leader: product.leader
            }
        )
    })
    productArr.sort((a, b) => a.name.localeCompare(b.name));
    productArr.forEach(index => {
        const productOption = document.createElement("option");
        productOption.textContent = index.name + "(" + index.unit + ") - " + index.price + "원";
        productOption.dataset.name = index.name;
        productOption.dataset.unit = index.unit;
        productOption.dataset.price = index.price;
        productOption.dataset.category = index.category;
        categoryDropdown.appendChild(productOption);
    })
}

//제품목록 기본구성
function setDropdownPlaceHolder() {
    categoryDropdown.innerHTML = "";
    const placeholderOption = document.createElement("option");
    placeholderOption.value = ""; // 빈 문자열로 설정
    placeholderOption.disabled = true; // 비활성화
    placeholderOption.selected = true; // 선택된 상태로 설정
    placeholderOption.hidden = true; // 숨김 처리
    placeholderOption.textContent = "제품 목록"; // 플레이스홀더 텍스트
    categoryDropdown.appendChild(placeholderOption);
}

//검색시 드롭다운설정
function SearchProduct() {
    const searchWord = document.getElementById("product-search").value;
    let tempDropdown = [];
    products.forEach(product => {
        if (product.name.includes(searchWord) || product.category.includes(searchWord) || searchWord == '') {
            tempDropdown.push(product);
        }
    })
    setDropdownPlaceHolder();

    tempDropdown.forEach(temp => {
        const SearchOption = document.createElement('option');
        SearchOption.textContent = temp.name + "(" + temp.unit + ") - " + temp.price + "원";
        SearchOption.dataset.name = temp.name;
        SearchOption.dataset.unit = temp.unit;
        SearchOption.dataset.price = temp.price;
        SearchOption.dataset.category = temp.category;

        categoryDropdown.appendChild(SearchOption);
    })
}


//주문 내역 초기화 함수
function clearOrderDetails() {
    document.getElementById('delivery-address').value = '';
    document.getElementById('customer-name').value = '';
    document.getElementById('contact-number').value = '';
    document.getElementById('delivery-notes').value = '';
    document.getElementById('order-details').value = '';
    document.getElementById('order-total').innerText = '주문 총액: 0원';
    const orderButton = document.getElementById("order-button");
    orderButton.style.display = "none";
    baguni = [];

    //clearDB()
}
//#endregion





function addToBaguni() {
    const selectedProduct = categoryDropdown.options[categoryDropdown.selectedIndex];
    let quantity = document.getElementById("quantity").value; // 수량

    const CurProduct = {
        name: selectedProduct.dataset.name,
        unit: selectedProduct.dataset.unit,
        price: selectedProduct.dataset.price,
        count: quantity,
        value: parseInt(quantity, 10) * parseInt(selectedProduct.dataset.price, 10)
    };

    const existingProductIndex = baguni.findIndex(product => product.name === CurProduct.name);

    if (existingProductIndex !== -1) {
        // 이름이 같은 CurProduct가 이미 존재하면 count만 업데이트
        baguni[existingProductIndex].count = parseInt(baguni[existingProductIndex].count) + parseInt(CurProduct.count, 10);
        baguni[existingProductIndex].value = baguni[existingProductIndex].price * baguni[existingProductIndex].count;
    } else {
        // 이름이 같은 CurProduct가 없으면 새로운 객체 추가
        baguni.push(CurProduct);
    }

    UpdateOrderDetails();
}


//baguni에 담긴 제품들을 order-details에 update한다.
//만약 총액이>=30,000이라면 주문하기 버튼을 활성화시킨다.
function UpdateOrderDetails() {
    const orderDetails = document.getElementById("order-details"); // 장바구니
    const orderTotal = document.getElementById("order-total"); // 주문총액
    orderDetails.value = '';
    curTotal = 0; console.log(baguni);

    baguni.forEach(item => {
        if (item.count != 0) {
            const menu = item.name + "(" + item.unit + ") * " + item.count + "개 = " + item.value + "원\n";
            orderDetails.value += menu;
            curTotal += item.value;
        }

    });

    orderTotal.innerText = `주문 총액: ${curTotal}원`;
    document.getElementById("quantity").value = 1;
    const orderButton = document.getElementById('order-button');
    if (curTotal >= 30000) {
        orderButton.style.display = "block";
    }
}

function ShowOrderDetails() {
    // 주문 내역이 비어있을 때는 팝업을 열지 않음
    if (baguni.length > 0) {
        const orderDetailsPopup = document.createElement('div');
        orderDetailsPopup.id = 'order-details-popup';

        const orderDetailsContent = document.createElement('ul');
        orderDetailsContent.id = 'order-details-list';
        baguni.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${item.name}(${item.unit})*
    <input type="number" value="${item.value / item.price}" id="${item.name}" style="width: 70px;" oninput="baguniOrderChange(this, '${item.name}')">
    개 = <span id="${item.name}-total">${item.value}원</span>`;

            listItem.dataset.name = item.name;
            orderDetailsContent.appendChild(listItem);

            // 항목을 클릭하면 선택/해제
            listItem.addEventListener('click', function () {
                listItem.classList.toggle('selected');
            });
        });

        orderDetailsPopup.appendChild(orderDetailsContent);

        // 삭제 버튼 추가
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '선택 삭제';
        deleteButton.addEventListener('click', function () {
            DeleteItemFrombaguni();
            orderDetailsPopup.remove(); // 선택 삭제 후 팝업 닫기
        });


        // 나가기 버튼 추가
        const closeButton = document.createElement('button');
        closeButton.textContent = '나가기';
        closeButton.id = 'close-button';
        closeButton.addEventListener('click', function () {
            baguni.forEach(item => {
                if (item.count === 0) {
                    const index = baguni.findIndex(product => product.name === item.name);
                    baguni.splice(index, 1);
                }
            })
            orderDetailsPopup.remove(); // 팝업 닫기
        });



        orderDetailsPopup.appendChild(deleteButton);
        orderDetailsPopup.appendChild(closeButton);

        document.body.appendChild(orderDetailsPopup);

        // 팝업 외부 클릭 시 팝업 닫기
        orderDetailsPopup.addEventListener('click', function (event) {
            if (event.target === orderDetailsPopup) {
                baguni.forEach(item => {
                    if (item.count === 0) {
                        const index = baguni.findIndex(product => product.name === item.name);
                        baguni.splice(index, 1);
                    }
                })
                orderDetailsPopup.remove();
            }
        });
    }
}

function baguniOrderChange(inputElement, itemName) {//현재 수량, 제품이름
    const index = baguni.findIndex(product => product.name === itemName);

    if (parseInt(inputElement.value, 10) === 0 || !inputElement.value) {
        // 해당 아이템이 baguni 배열에 존재한다면 삭제
        if (index !== -1) {
            baguni[index].count = 0;
            baguni[index].value = 0;
        }
    } else {
        if (index !== -1) {
            baguni[index].count = parseInt(inputElement.value, 10);
            baguni[index].value = baguni[index].count * baguni[index].price;
        }
    }

    const totalPrice = baguni[index].value;
    // 가격을 표시할 <span> 업데이트
    const totalSpan = document.getElementById(`${itemName}-total`);
    if (totalSpan) {
        totalSpan.textContent = `${totalPrice}원`;
    }

    UpdateOrderDetails();
}

function DeleteItemFrombaguni() {
    const selectedItems = document.querySelectorAll('#order-details-list li.selected');
    const selectedItemsArray = Array.from(selectedItems);
    selectedItemsArray.forEach(item => {
        const itemName = item.dataset.name;
        const index = baguni.findIndex(product => product.name === itemName);
        if (index !== -1) {
            baguni.splice(index, 1);
        }
    });

    document.getElementById('order-details-popup').innerHTML = '';
    UpdateOrderDetails();
}


function presetClick() {
    const request = indexedDB.open('CurOrder', 1);
    const dropdown = document.getElementById('presetDropdown');
    const clickedKey = dropdown.options[dropdown.selectedIndex].id;
    for (const option of dropdown.options) {
        option.selected = false;
    }
    request.onsuccess = function (event) {
        const db = event.target.result;

        // preset 테이블에서 데이터 가져오기
        const transaction = db.transaction(['preset'], 'readonly');
        const presetStore = transaction.objectStore('preset');
        const getRequest = presetStore.get(clickedKey);


        getRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            cursor.presetMenu.forEach(item => {
                const target = products.find(product => product.name === item.name);
                if (target) {
                    const CurProduct = {
                        name: item.name,
                        unit: item.unit,
                        count: item.quantity,
                        price: target.price,
                        category: target.category,
                        value: parseInt(item.quantity) * parseInt(target.price)
                        // 여기에 다른 필요한 정보들도 추가할 수 있습니다.
                    };
                    const existingProductIndex = baguni.findIndex(product => product.name === CurProduct.name);

                    if (existingProductIndex !== -1) {
                        // 이름이 같은 CurProduct가 이미 존재하면 count만 업데이트
                        baguni[existingProductIndex].count = parseInt(baguni[existingProductIndex].count) + parseInt(CurProduct.count, 10);
                        baguni[existingProductIndex].value = baguni[existingProductIndex].price * baguni[existingProductIndex].count;
                    } else {
                        // 이름이 같은 CurProduct가 없으면 새로운 객체 추가
                        baguni.push(CurProduct);
                    }

                    UpdateOrderDetails();
                    document.getElementById('presetDropdown').innerHTML = initialDropdownHTML;
                    updateDropdownOptions();
                }

            })

        };
    };

}







function ShowPreSet(check) {
    if (check) {
        const confirmation = confirm("즐겨찾기의 등록을 원하시면 \"확인\"버튼을,\n조회를 원하시면 \"취소\"버튼을 눌러주세요");
        PresetMode = confirmation;
    }
    Presetbaguni = [];
    if (PresetMode) {
        Presetbaguni.push(...baguni.map(item => ({ ...item })));
        const PresetDetails = document.getElementById("preset-details"); // 장바구니
        PresetDetails.value = '';
        Presetbaguni.forEach(item => {
            const menu = item.name + "(" + item.unit + ") * " + item.count + "개 = " + item.value + "원\n";
            PresetDetails.value += menu;
        });
    }
    document.getElementById("myModal").style.display = "flex";
    console.log(Presetbaguni);
}

document.getElementById("preset-details").addEventListener('click', () => {
    document.getElementById("myModal").style.display = "none";
    showPrsetOrderDetails();
})


function showPrsetOrderDetails() {

    if (Presetbaguni.length > 0) {
        //const orderDetails = document.getElementById("preset-details"); // 장바구니
        const orderDetailsPopup = document.createElement('div');
        orderDetailsPopup.id = 'order-details-popup';
        // 주문 내역이 비어있을 때는 팝업을 열지 않음


        const orderDetailsContent = document.createElement('ul');
        orderDetailsContent.id = 'order-details-list';
        Presetbaguni.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${item.name}(${item.unit})*
    <input type="number" value="${item.value / item.price}" id="${item.name}" style="width: 70px;" oninput="PresetbaguniOrderChange(this, '${item.name}')">
    개 = <span id="${item.name}-total">${item.value}원</span>`;

            listItem.dataset.name = item.name;
            orderDetailsContent.appendChild(listItem);

            // 항목을 클릭하면 선택/해제
            listItem.addEventListener('click', function () {
                listItem.classList.toggle('selected');
            });
        });

        orderDetailsPopup.appendChild(orderDetailsContent);

        // 삭제 버튼 추가
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '선택 삭제';
        deleteButton.style.marginBottom = "10px";
        deleteButton.addEventListener('click', function () {
            //line div를 삭제하는함수 생성
            DeletePresetItem();
            orderDetailsPopup.remove(); // 선택 삭제 후 팝업 닫기
            document.getElementById("myModal").style.display = "flex";
            UpdatePresetOrderDetails();
        });

        const SaveButton = document.createElement('button');
        SaveButton.textContent = '저장';
        SaveButton.addEventListener('click', function () {
            orderDetailsPopup.remove(); // 팝업 닫기
            document.getElementById("myModal").style.display = "flex";
            UpdatePresetOrderDetails();
        });


        // 나가기 버튼 추가
        const closeButton = document.createElement('button');
        closeButton.textContent = '나가기';
        closeButton.id = 'close-button';
        closeButton.addEventListener('click', function () {
            orderDetailsPopup.remove(); // 팝업 닫기
            document.getElementById("myModal").style.display = "flex";
            MinusPresetOrderDetails();
            UpdatePresetOrderDetails();
            Presetbaguni = [];
        });



        orderDetailsPopup.appendChild(deleteButton);
        orderDetailsPopup.appendChild(SaveButton);
        orderDetailsPopup.appendChild(closeButton);

        document.body.appendChild(orderDetailsPopup);

        // 팝업 외부 클릭 시 팝업 닫기
        orderDetailsPopup.addEventListener('click', function (event) {
            if (event.target === orderDetailsPopup) {
                orderDetailsPopup.remove(); // 팝업 닫기
                document.getElementById("myModal").style.display = "flex";
                MinusPresetOrderDetails();
                UpdatePresetOrderDetails();
                Presetbaguni = [];
            }
        });
    }

    else {
        window.alert("현재 Preset바구니는 비어있습니다.");
        ShowPreSet(false);
    }


}


function PresetbaguniOrderChange(inputElement, itemName) {//현재 수량, 제품이름
    const index = Presetbaguni.findIndex(product => product.name === itemName);

    if (parseInt(inputElement.value, 10) === 0 || !inputElement.value) {
        // 해당 아이템이 baguni 배열에 존재한다면 삭제
        if (index !== -1) {
            Presetbaguni[index].count = 0;
            Presetbaguni[index].value = 0;
        }
    } else {
        if (index !== -1) {
            Presetbaguni[index].count = parseInt(inputElement.value, 10);
            Presetbaguni[index].value = Presetbaguni[index].count * Presetbaguni[index].price;
        }
    }
    if (Presetbaguni[index]) {
        const totalPrice = Presetbaguni[index].value;
        // 가격을 표시할 <span> 업데이트
        const totalSpan = document.getElementById(`${itemName}-total`);
        if (totalSpan) {
            totalSpan.textContent = `${totalPrice}원`;
        }
    }
    console.log(baguni);
    UpdatePresetOrderDetails();
}

//Presetbaguni에 담은 제품을 preset-details에 update
function UpdatePresetOrderDetails() {
    const orderDetails = document.getElementById("preset-details"); // 장바구니
    orderDetails.value = '';
    console.log(Presetbaguni);
    Presetbaguni.forEach(item => {
        if (item.count != 0) {
            const menu = item.name + "(" + item.unit + ") * " + item.count + "개 = " + item.value + "원\n";
            orderDetails.value += menu;
        }
    });
}

//Presetbaguni의 제품 중 count=0인 제품을 Presetbaguni에서 삭제한다.
function MinusPresetOrderDetails() {
    const orderDetails = document.getElementById("preset-details"); // 장바구니
    orderDetails.value = '';
    console.log(Presetbaguni);
    Presetbaguni.forEach(item => {
        if (item.count == 0) {
            const index = Presetbaguni.findIndex(product => product.name === item.name);
            Presetbaguni.splice(index, 1);
        }
    });
}


//Preset창에서 X버튼 클릭 시 preset-details를 초기화 하고 
//baguni를 이용해서 현재 주문상태를 order-details에 update한 후
//dropdown목록을 curOrder->preset 테이블의 정보를 바탕으로 최신화한다.
document.getElementById("PresetcloseButton").addEventListener("click", function () {
    document.getElementById("myModal").style.display = "none";
    // Presetbaguni = [];
    const PresetDetails = document.getElementById("preset-details"); // 장바구니
    PresetDetails.value = '';
    const presetName = document.getElementById("presetTitle");
    presetName.value = '';
    UpdateOrderDetails();
    updateDropdownOptions();

    if (SelectedButton) {
        const clickedButtons = document.getElementsByName(SelectedButton);
        const clickedButton = clickedButtons[0];
        // clickedButton.textContent = "등록가능";
        const initialColor = '#4CAF50';
        clickedButton.style.backgroundColor = initialColor;
        SelectedButton = '';
    }
});

//selected판정이 된 제품들을 Presetbaguni에서 제거한다.
function DeletePresetItem() {
    const selectedItems = document.querySelectorAll('#order-details-list li.selected');
    const selectedItemsArray = Array.from(selectedItems);
    selectedItemsArray.forEach(item => {
        const itemName = item.dataset.name;
        const index = Presetbaguni.findIndex(product => product.name === itemName);
        if (index !== -1) {
            Presetbaguni.splice(index, 1);
        }

    });
    UpdatePresetOrderDetails();
    document.getElementById('order-details-popup').innerHTML = '';


}


//저장 버튼 클릭시 만약 입력된 이름이 없다면 이름을 입력받게 한다.
//선택된 버튼에 현재 Presetbaguni의 내용을 저장한다.
//현재 Preset창의 초기화 및 Preset 버튼들의 이름 최신화
document.getElementById("PresetSaveButton").addEventListener("click", function () {

    const presetName = document.getElementById("presetTitle");
    if (presetName.value == '') {
        window.alert("이름을 입력해주세요");
        return;
    }



    if (SelectedButton) {
        presetSave(SelectedButton);
        // document.getElementById("myModal").style.display = "none";
        // Presetbaguni=[];
        MinusPresetOrderDetails();//->close버튼기능으로 이동
        document.getElementById("presetTitle").value = '';
        SelectedButton = '';

        //  document.getElementById("myModal").style.display = "flex";


    }
    else
        window.alert("선택된 버튼이 없습니다.");
})

//현재 선택된 버튼의 id에 해당하는 curOrder->preset 테이블키에 Presetbaguni의 내용을 할당
function presetSave(SelectedButton) {
    const presetName = document.getElementById("presetTitle");
    const tempTitle = presetName.value;
    const clickedButtons = document.getElementsByName(SelectedButton);
    const clickedButton = clickedButtons[0];

    clickedButton.textContent = presetName.value;
    const dropdown = document.getElementById('presetDropdown');
    const option = dropdown.querySelector(`option[value="${clickedButton.id}"]`);

    if (option) {
        console.log(presetName.value);
        const newTextContent = presetName.value; // 외부에서 가져온 새로운 내용
        option.textContent = newTextContent;
        option.presetName = newTextContent;
    }

    const request = indexedDB.open('CurOrder', 1);
    const clickedKey = clickedButton.id;
    console.log(clickedKey);

    request.onsuccess = function (event) {
        const db = event.target.result;

        // preset 테이블에서 데이터 가져오기
        const transaction = db.transaction(['preset'], 'readwrite');
        const presetStore = transaction.objectStore('preset');
        const getRequest = presetStore.get(clickedKey);


        getRequest.onsuccess = function (e) {
            const existingPresetData = e.target.result;
            if (existingPresetData) {
                existingPresetData.presetTitle = tempTitle;
                existingPresetData.presetMenu = [];

                Presetbaguni.forEach(item => {
                    existingPresetData.presetMenu.push({
                        name: item.name,
                        unit: item.unit,
                        quantity: item.count
                    });
                });

                const updateTransaction = db.transaction(['preset'], 'readwrite');
                const updatePresetStore = updateTransaction.objectStore('preset');
                const updateRequest = updatePresetStore.put(existingPresetData);

                updateRequest.onsuccess = function () {
                    console.log('Data updated successfully');

                    document.getElementById(clickedButton.id).textContent = existingPresetData.presetTitle;
                    updateDropdownOptions();
                };

                updateRequest.onerror = function (error) {
                    console.error('Error updating data:', error);
                };
            }
            Presetbaguni = [];
            const initialColor = '#4CAF50';
            clickedButton.style.backgroundColor = initialColor;
        };

    };
}

//현재 선택된 버튼의 id에 해당하는 curOrder->preset 테이블키의 presetMenu를 초기화
document.getElementById("PresetDeleteButton").addEventListener("click", function () {
    if (SelectedButton) {
        const clickedButtons = document.getElementsByName(SelectedButton);
        const clickedButton = clickedButtons[0];
        clickedButton.textContent = "등록가능";
        const request = indexedDB.open('CurOrder', 1);
        const clickedKey = clickedButton.id;

        request.onsuccess = function (event) {
            const db = event.target.result;

            // preset 테이블에서 데이터 가져오기
            const transaction = db.transaction(['preset'], 'readwrite');
            const presetStore = transaction.objectStore('preset');
            const getRequest = presetStore.get(clickedKey);


            getRequest.onsuccess = function (e) {
                const existingPresetData = e.target.result;
                existingPresetData.presetTitle = "등록가능";
                existingPresetData.presetMenu = [];

                // 업데이트된 데이터를 다시 저장
                const updateTransaction = db.transaction(['preset'], 'readwrite');
                const updatePresetStore = updateTransaction.objectStore('preset');
                const updateRequest = updatePresetStore.put(existingPresetData);
                updateDropdownOptions();

                Presetbaguni = [];
                const PresetDetails = document.getElementById("preset-details"); // 장바구니
                PresetDetails.value = '';
                const PresetTitle = document.getElementById("presetTitle").value = '';
                const initialColor = '#4CAF50';
                clickedButton.style.backgroundColor = initialColor;
            }
        }
    }

    else
        window.alert("선택된 버튼이 없습니다.");
})

document.getElementById("PresetAddButton").addEventListener("click", function () {
    window.alert("장바구니에 제품들이 추가되었습니다.");
    Presetbaguni.forEach(item => {
        const target = products.find(product => product.name === item.name);
        const baguniProduct = baguni.find(product => product.name === item.name);
        if (baguniProduct) {
            // 이미 존재하는 상품인 경우 업데이트
            baguniProduct.count += item.count;
            baguniProduct.value = parseInt(baguniProduct.count) * parseInt(target.price);
        }
        else {
            baguni.push({
                name: item.name,
                count: item.count,
                unit: item.unit,
                price: target.price,
                value: parseInt(item.count) * parseInt(target.price)
            })
        }
    })
})
//Preset버튼에 정보가 저장되어있는지 확인
function CheckPresetButton(ButtonID) {
    return new Promise((resolve) => {
        const request = indexedDB.open('CurOrder', 1);
        request.onsuccess = function (event) {
            const db = event.target.result;

            // preset 테이블에서 데이터 가져오기
            const transaction = db.transaction(['preset'], 'readwrite');
            const presetStore = transaction.objectStore('preset');
            const getRequest = presetStore.get(ButtonID);

            getRequest.onsuccess = function (e) {
                const existingPresetData = e.target.result;
                // Promise를 사용하여 비동기 작업 결과 반환
                resolve(existingPresetData.presetMenu.length > 0);
            };
        };
    });
}

//Preset버튼에 저장된 정보를 Presetbaguni로 Load
function LoadMenuToPresetbaguni(ButtonID) {
    const request = indexedDB.open('CurOrder', 1);
    request.onsuccess = function (event) {
        const db = event.target.result;

        // preset 테이블에서 데이터 가져오기
        const transaction = db.transaction(['preset'], 'readwrite');
        const presetStore = transaction.objectStore('preset');
        const getRequest = presetStore.get(ButtonID);
        Presetbaguni = [];
        getRequest.onsuccess = function (e) {
            const existingPresetData = e.target.result;
            if (existingPresetData.presetTitle != "등록가능")
                document.getElementById("presetTitle").value = existingPresetData.presetTitle;
            else
                document.getElementById("presetTitle").value = '';
            existingPresetData.presetMenu.forEach(item => {
                const target = products.find(product => product.name === item.name);
                if (target) {
                    Presetbaguni.push({
                        name: item.name,
                        unit: item.unit,
                        count: item.quantity,
                        price: target.price,
                        value: parseInt(item.quantity) * parseInt(target.price)
                    });
                }
            })
            UpdatePresetOrderDetails();
        }


    }
}

async function PrintPresetData(ClickedButton) {
    if (PresetMode) {
        if (Presetbaguni.length > 0) {
            try {
                const result = await CheckPresetButton(ClickedButton.id);
                if (result) {
                    window.alert("이미 저장된 정보가 있습니다.\n삭제처리 이후 추가할 수 있습니다.");
                } else {
                    //SelectedButton = ClickedButton.name;
                    clickedButtonColorChange(ClickedButton.name);
                }
            } catch (error) {
                console.error('Error checking preset button:', error);
            }
        } else {
            if (CheckPresetButton(ClickedButton.id)) {
                console.log(Presetbaguni);
                LoadMenuToPresetbaguni(ClickedButton.id);
                UpdatePresetOrderDetails();
                //SelectedButton = ClickedButton.name;
                clickedButtonColorChange(ClickedButton.name);
            } else {
                window.alert("해당 페이지는 즐겨찾기 조회 및 수정을 위한 페이지입니다.");
                //SelectedButton = ClickedButton.name;
                clickedButtonColorChange(ClickedButton.name);
            }
        }
    }

    else {
        if (CheckPresetButton(ClickedButton.id)) {
            console.log(Presetbaguni);
            LoadMenuToPresetbaguni(ClickedButton.id);
            UpdatePresetOrderDetails();
            //SelectedButton = ClickedButton.name;
            clickedButtonColorChange(ClickedButton.name);
        }
    }
}


function clickedButtonColorChange(NewButton) {
    if (SelectedButton) {
        const clickedButtons = document.getElementsByName(SelectedButton);
        const clickedButton = clickedButtons[0];
        const initialColor = '#4CAF50';
        clickedButton.style.backgroundColor = initialColor;
    }
    SelectedButton = NewButton;
    const CurButton = document.getElementsByName(SelectedButton);
    const CurclickedButton = CurButton[0];
    CurclickedButton.style.backgroundColor = '#2196F3';
}





// 변경된 부분: 클립보드에 복사하는 함수
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.body.removeChild(textarea);
}




