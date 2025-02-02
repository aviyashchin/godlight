export class State {
  constructor(name) {
    this.name = name;
  }
  
  enter(entity) {}
  execute(entity) {}
  exit(entity) {}
}

export class StateMachine {
  constructor(entity) {
    this.entity = entity;
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.stateTime = 0;
  }

  addState(state) {
    this.states.set(state.name, state);
    return this;
  }

  setState(stateName) {
    if (this.currentState) {
      this.currentState.exit(this.entity);
      this.previousState = this.currentState;
    }
    
    this.currentState = this.states.get(stateName);
    this.stateTime = 0;
    if (this.currentState) {
      this.currentState.enter(this.entity);
    }
  }

  update(delta) {
    if (this.currentState) {
      this.stateTime += delta;
      this.currentState.execute(this.entity);
    }
  }

  revertToPreviousState() {
    if (this.previousState) {
      this.setState(this.previousState.name);
    }
  }
} 