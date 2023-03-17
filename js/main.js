let eventBus = new Vue()

Vue.component('main-list', {
    template: `
    <div>
        <create-task></create-task>
        <columns></columns>
    </div>
    `
})

Vue.component('columns', {

    template: `
        <div class="glob-list">
            <column class="column" :colIndex="colIndex1" :name="name" :col="columns[0]" @changeTask="changeTask" :class="{block1col: block1col}" :block1col="block1col"></column>
            <column class="column" :colIndex="colIndex2" :name="name2" :col="columns[1]" @changeTask="changeTask"></column>
            <column class="column" :colIndex="colIndex3" :name="name3" :col="columns[2]" @changeTask="changeTask"></column>
            <column class="column" :colIndex="colIndex4" :name="name3" :col="columns[3]" @changeTask="changeTask"></column>
        </div>
    `,
    data() {
        return {
            temporalCol: [],
            columns: [
                [],
                [],
                [],
                [],
            ],

            name: 'Запланированные задачи',
            name2: 'Задачи в работе',
            name3: 'Тестирование',
            name4: 'Выполненные задачи',

            colIndex1: 0,
            colIndex2: 1,
            colIndex3: 2,

            block1col: false,
        }
    },
    mounted() {
        const saveCols = localStorage.getItem('columns')
        if(saveCols){
            this.columns = JSON.parse(saveCols)
        }

        eventBus.$on('review-submitted', taskReview => {
            console.log(this.columns[0].length);
            if (!this.block1col){
                if (this.columns[0].length<3){
                    console.log('puncts', taskReview.puncts)
                    this.columns[0].push(taskReview)
                    this.saveCols()
                }
            }
        })
    },
    watch:{
        columns: {
            handler: 'saveCols',
            deep: true
        }
    },
    methods: {
        saveCols(){
            localStorage.setItem('columns', JSON.stringify(this.columns))
        },
        changeTask(task) {
            (!this.columns[task.colIndex][task.index].puncts[task.indexPuncts].done) ? this.columns[task.colIndex][task.index].puncts[task.indexPuncts].done = true : this.columns[task.colIndex][task.index].puncts[task.indexPuncts].done = false
            let movingTask = this.columns[task.colIndex][task.index]
            this.moveTask(movingTask, task)
        },
        moveTask(movingTask, task) {
            let allLength = movingTask.puncts.length
            let doneLength = 0
            for (let i of movingTask.puncts) {
                if (i.done === true) {
                    doneLength++
                }
            }

            if (doneLength > allLength / 2 && doneLength !== allLength && this.columns[task.colIndex] === this.columns[0]) {
                if (this.columns[1].length<5){
                    let move = this.columns[task.colIndex].splice(task.index, 1)
                    this.columns[task.colIndex + 1].push(...move)
                } else {
                    this.block1col = true
                }
            }

            if (doneLength === allLength) {
                let move = this.columns[task.colIndex].splice(task.index, 1)
                this.columns[2].push(...move)
                this.dateTask(movingTask)
                this.block1col = false
            }
        },
        dateTask(movingTask){
            let date = new Date()
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            let time = date.toLocaleTimeString()
            let strDate = year+'-'+month+'-'+day+' , '+time
            movingTask.dateEnd = strDate
        }
    },
})

Vue.component('column', {
    props: {
        col: {
            type: Array,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        colIndex: {
            type: Number,
            required: true
        },
        block1col: {
            type: Boolean,
            required: false
        }
    },
    template: `
        <div>
            <h3>{{name}}</h3>
            <p>
               <div>
                <p v-if="!col.length">Нет тасков</p>
                
                  <ul>
                    <li
                    v-for="(pun, index) in col" 
                    class="taskBorder"
                    :key="pun.id"
                    >
                        <h3>{{pun.name}}</h3>
                        <p>{{pun.id}}</p>
                        <ul class="inUl">
                            <li 
                              v-for="prop, indexPuncts in pun.puncts"
                              v-if="prop.punct!==null"
                              >
                                <label :for="pun.id">
                                <input
                                    type="checkbox"
                                    :disabled="prop.done || block1col"
                                    :checked="prop.done"
                                    id="pun.id" 
                                    value="1"
                                    @change="changeTask(index, indexPuncts, colIndex)"
                                    >{{prop.punct}}<p>{{prop.done}}</p></label><br>
                            </li>
                        </ul>
                        <p>{{pun.dateEnd}}</p>
                    </li>
                </ul>
            </div>
           </p>
        </div>
    `,
    data() {
        return {
            checkdTask: [],
            count: null,
            strDate: null
        }
    },
    methods: {
        changeTask(index, indexPuncts, colIndex) {
            console.log(this.strDate)
            this.$emit('changeTask', {index, indexPuncts, colIndex})
        },
    }
})

Vue.component('create-task', {
    template: `
        <div>
            <form class="task-form" @submit.prevent="onSubmit">
            <div class="container">
                <h3 class="logo">Создать заметку</h3>
                <p v-if="errors">
                    <b>Необходимое колличество пунктов от 3 до 5</b>
                </p>
                <div class="punct">
                    <label for="name" class="form-p">Название:</label>
                    <input required id="name" v-model="name" type="text">
                </div>
                <p>Пункты:</p>
                <div class="punct">
                    <label for="punct1" class="form-p">1:</label>
                    <input id="punct1" v-model="punct1" type="text"></div>
                <div class="punct">
                    <label for="punct2" class="form-p">2:</label>
                    <input id="punct2" v-model="punct2"  type="text"></div>
                <div class="punct">
                    <label for="punct3" class="form-p">3:</label>
                    <input id="punct3" v-model="punct3"  type="text"></div>
                <div class="punct">
                    <label for="punct4" class="form-p">4:</label>
                    <input id="punct4" v-model="punct4"  type="text"></div>
                <div class="punct">
                    <label for="punct5" class="form-p">5:</label>
                    <input id="punct5" v-model="punct5"  type="text"></div>
                <input type="submit" value="Добавить" class="btn">
            </div>
            </form>
        </div>
    `,
    data() {
        return {
            name: null,
            puncts:[],
            punct1: null,
            punct2: null,
            punct3: null,
            punct4: null,
            punct5: null,
            id: 1,
            countDone: 0,
            errors: 0,
            checkLength: []
        }
    },
    methods: {
        onSubmit() {
            this.checkLength = []
            this.checkLength.push(
                this.punct1,
                this.punct2,
                this.punct3,
                this.punct4,
                this.punct5,
            )
            this.checkLength = this.checkLength.filter(Boolean);
            if (this.checkLength.length > 2) {
                let taskReview = {
                    name: this.name,
                    puncts: [
                        {
                            punct: this.punct1,
                            done: false
                        },
                        {
                            punct: this.punct2,
                            done: false
                        },
                        {
                            punct: this.punct3,
                            done: false
                        },
                        {
                            punct: this.punct4,
                            done: false
                        },
                        {
                            punct: this.punct5,
                            done: false
                        },
                    ],
                    dateEnd:null,
                    id: this.id,
                    countDone: this.countDone
                }
                taskReview.puncts = this.removeEmptyValues(taskReview.puncts)
                this.idIncrease()
                eventBus.$emit('review-submitted', taskReview)
                this.name = null
                this.punct1 = null
                this.punct2 = null
                this.punct3 = null
                this.punct4 = null
                this.punct5 = null
                this.clearCheckLength()

            } else {
                this.errors = 1
                this.clearCheckLength()
            }
        },
        idIncrease() {
            this.id++
        },
        clearCheckLength() {
            return this.checkLength = []
        },

        removeEmptyValues(arr) {

            arr = arr.filter(el => {
                if (el.punct !== null || '' || undefined) {
                    return el.punct;
                }

            })
            return arr
        }
    }
})

let app = new Vue({
    el: '#app',
    methods: {}
})