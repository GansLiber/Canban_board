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
            <column class="column" :colIndex="colIndex4" :name="name4" :col="columns[3]" @changeTask="changeTask"></column>
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
            colIndex4: 3,

            block1col: false,
        }
    },
    mounted() {
        // const saveCols = localStorage.getItem('columns')
        // if(saveCols){
        //     this.columns = JSON.parse(saveCols)
        // }

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
    // watch:{
    //     columns: {
    //         handler: 'saveCols',
    //         deep: true
    //     }
    // },
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
                this.block1col = false
            }
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
                        <p>{{pun.description}}</p><br>
                        <p>Дедлайн:</p><p>{{pun.deadline}}</p>
                        <p>Дата создания:</p><p>{{pun.dateStart}}</p>

                        <input v-show="colIndex===0"  type="button" @click="changeTask(index, indexPuncts, colIndex)" value="Удалить">
                        <input v-show="colIndex!==3"  type="button" @click="moveTask(index, indexPuncts, colIndex)" value="Далее">
                        <input v-show="colIndex!==3"  type="button" @click="changeTask(index, indexPuncts, colIndex)" value="Редактировать">
                    </li>
                </ul>
            </div>
           </p>
        </div>
    `,
    data() {
        return {
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
                <h3 class="logo">Создать задачу</h3>
                <div class="punct">
                    <label for="name" class="form-p">Название:</label>
                    <input required id="name" v-model="name" type="text">
                </div><br>
                <div class="punct">
                    <label for="description" class="form-p">Описание задачи:</label>
                    <input id="description" v-model="description" type="text"></div>
                <div class="punct">
                    <label for="deadline" class="form-p">Дедлайн:</label>
                    <input id="deadline" v-model="deadline"  type="date"></div>
                <input type="submit" value="Добавить" class="btn">
            </div>
            </form>
        </div>
    `,
    data() {
        return {
            name: null,
            description: null,
            deadline: null,
            id: 1,
            countDone: 0,
            errors: 0,
            checkLength: [],
            dateStart:null
        }
    },
    methods: {
        onSubmit() {
            this.dateTask()
            let taskReview = {
                name: this.name,
                description: this.description,
                deadline: this.deadline,
                dateStart: this.dateStart,
                id: this.id,
            }
            // taskReview.puncts = this.removeEmptyValues(taskReview.puncts)
            this.idIncrease()
            eventBus.$emit('review-submitted', taskReview)
            this.name = null
            this.description = null
            this.deadline = null
            this.dateStart = null
        },
        idIncrease() {
            this.id++
        },
        clearCheckLength() {
            return this.checkLength = []
        },

        // removeEmptyValues(arr) {
        //
        //     arr = arr.filter(el => {
        //         if (el.punct !== null || '' || undefined) {
        //             return el.punct;
        //         }
        //
        //     })
        //     return arr
        // },
        dateTask(){
            let date = new Date()
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            let time = date.toLocaleTimeString()
            let strDate = year+'-'+month+'-'+day+' , '+time
            this.dateStart = strDate
        }
    }
})

let app = new Vue({
    el: '#app',
    methods: {}
})