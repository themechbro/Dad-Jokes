import axios from "axios";
import Joke from "./joke";
import react, { Component } from "react";
import "./jokelist.css";
import { v4 as uuidv4 } from "uuid";

class JokeList extends Component {
  static defaultProps = {
    numJokesToget: 10,
  };
  constructor(props) {
    super(props);
    this.state = { jokes: JSON.parse(window.localStorage.getItem('jokes')|| '[]'), 
    loading:false };
    this.seenJokes= new Set(this.state.jokes.map(j=> j.text));
    console.log(this.seenJokes);
    this.handleClick= this.handleClick.bind(this);
  }


  handleVote(id, delta) {
    this.setState((st) => ({
      jokes: st.jokes.map((j) =>
        j.id === id ? { ...j, votes: j.votes + delta } : j,
      ),
    }),
    ()=>window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    );
  }

   handleClick(){
    this.setState({loading:true}, this.getJokesfrombutton);
    
      
  }

  async getJokesfrombutton(){
    try{
    let jokes = [];
    while (jokes.length < this.props.numJokesToget) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJoke=res.data.joke;
        if(!this.seenJokes.has(newJoke)){     
               jokes.push({ id: uuidv4(), text: res.data.joke, votes: 0 });
    }else{
        console.log('Found Duplicate');
        console.log(newJoke);
    }
      }
      this.setState(st=>({
        loading:false,
        jokes:[...st.jokes, ...jokes]
      }),
      ()=> window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
      );
  }catch(e){
    alert(e);
    this.setState({loading:false});
  }
}


  async componentDidMount() {
    if(this.state.jokes.length===0){
        let jokes = [];
        while (jokes.length < this.props.numJokesToget) {
          let res = await axios.get("https://icanhazdadjoke.com/", {
            headers: { Accept: "application/json" },
          });
          jokes.push({ id: uuidv4(), text: res.data.joke, votes: 0 });
        }
        this.setState({ jokes: jokes });
        window.localStorage.setItem('jokes',JSON.stringify(jokes));
    }
    
  }




  render() {
    if(this.state.loading){
        return <div className="spinner">
            <i class="fa-regular fa-face-laugh fa-spin fa-2xl"></i>
            <h1>Loading.....</h1>
        </div>;
    }
    let jokes=this.state.jokes.sort((a,b)=> b.votes-a.votes);
    return (
      <div className="jokelist">
        <div className="jokelist-sidebar">
          <h1 className="jokelist-title">
            <span>Dad</span> Jokes
          </h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
          <button className="jokelist-getmore" onClick={this.handleClick}>Fetch Jokes</button>
        </div>

        <div className="jokelist-joke">
          {jokes.map((j) => (
            <Joke
              key={j.id}
              votes={j.votes}
              text={j.text}
              upvote={() => this.handleVote(j.id, 1)}
              downVote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default JokeList;
